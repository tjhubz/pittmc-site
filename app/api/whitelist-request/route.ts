import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyEmailToken } from "@/lib/verification";
import { updateWhitelistWebhook, WhitelistStep } from "@/lib/discord-webhook";

// External API configuration
const WHITELIST_API_BASE = process.env.WHITELIST_API_BASE || "https://api.pittmc.com";
const WHITELIST_API_ROUTE = process.env.WHITELIST_API_ROUTE;
const AUTH_USERNAME = process.env.WHITELIST_API_USERNAME;
const AUTH_PASSWORD = process.env.WHITELIST_API_PASSWORD;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// This function is deprecated in favor of updateWhitelistWebhook
async function sendDiscordWebhook(email: string, username: string, edition: string, device?: string) {
  if (!DISCORD_WEBHOOK_URL) {
    console.error("Discord webhook URL not configured");
    return;
  }

  try {
    const webhookData = {
      embeds: [{
        title: "Whitelist Process: Completed",
        color: 5814783, // Green color
        fields: [
          {
            name: "Email",
            value: email,
            inline: true
          },
          {
            name: "Username",
            value: username,
            inline: true
          },
          {
            name: "Edition",
            value: edition,
            inline: true
          },
          {
            name: "Device",
            value: device || "Not specified",
            inline: true
          },
          {
            name: "Status",
            value: "Whitelist Request Completed",
            inline: false
          },
          {
            name: "Time",
            value: new Date().toISOString(),
            inline: false
          }
        ],
        footer: {
          text: "Step 5/5: Completed"
        },
        timestamp: new Date().toISOString()
      }]
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });
    
    console.log(`Discord webhook notification sent for ${username}`);
  } catch (error) {
    console.error("Error sending Discord webhook:", error);
    // Fail silently - don't affect the main process if webhook fails
  }
}

interface WhitelistRequestBody {
  username: string;
  edition: "java" | "bedrock";
  token: string;
  device?: string; // Optional field that might be in old requests
  sessionId?: string; // Session ID for webhook tracking (might be missing in old requests)
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body as JSON
    const body = await request.json() as WhitelistRequestBody;
    
    if (!body.username || !body.edition || !body.token) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get KV namespace from Cloudflare context
    const { env } = getCloudflareContext();
    
    if (!env?.VERIFICATION_CODES) {
      console.error("KV namespace not available");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify the token and extract the email
    const email = await verifyEmailToken(body.token, env);
    
    if (!email) {
      // Update Discord webhook if sessionId is available
      if (body.sessionId) {
        await updateWhitelistWebhook(body.sessionId, WhitelistStep.Completed, {
          error: "Invalid or expired token"
        });
      }
      
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Validate the username based on edition type
    if (body.edition === "java") {
      // Java usernames are 3-16 characters and only allow letters, numbers, and underscores
      if (!/^[a-zA-Z0-9_]{3,16}$/.test(body.username)) {
        // Update Discord webhook if sessionId is available
        if (body.sessionId) {
          await updateWhitelistWebhook(body.sessionId, WhitelistStep.Completed, {
            error: "Invalid Java username format",
            email
          });
        }
        
        return NextResponse.json(
          { error: "Invalid Java username format" },
          { status: 400 }
        );
      }
    } else if (body.edition === "bedrock") {
      // Bedrock usernames have different rules, but still limit length
      if (body.username.length < 1 || body.username.length > 16) {
        // Update Discord webhook if sessionId is available
        if (body.sessionId) {
          await updateWhitelistWebhook(body.sessionId, WhitelistStep.Completed, {
            error: "Invalid Bedrock username length",
            email
          });
        }
        
        return NextResponse.json(
          { error: "Invalid Bedrock username length" },
          { status: 400 }
        );
      }
    } else {
      // Update Discord webhook if sessionId is available
      if (body.sessionId) {
        await updateWhitelistWebhook(body.sessionId, WhitelistStep.Completed, {
          error: "Invalid edition type",
          email
        });
      }
      
      return NextResponse.json(
        { error: "Invalid edition type" },
        { status: 400 }
      );
    }
    
    // Store a record of this whitelist request for audit purposes
    const record = {
      email,
      username: body.username,
      edition: body.edition,
      device: body.device,
      timestamp: new Date().toISOString()
    };
    
    const recordKey = `whitelist:${email}:${Date.now()}`;
    await env.VERIFICATION_CODES.put(recordKey, JSON.stringify(record), { expirationTtl: 86400 * 90 }); // 90 days
    
    // Call the PittMC API to whitelist the user
    try {
      // Check if required environment variables are set
      if (!WHITELIST_API_ROUTE || !AUTH_USERNAME || !AUTH_PASSWORD) {
        console.error("Missing required API configuration");
        
        // Update Discord webhook if sessionId is available
        if (body.sessionId) {
          await updateWhitelistWebhook(body.sessionId, WhitelistStep.Completed, {
            error: "Whitelist API not properly configured",
            email,
            username: body.username,
            edition: body.edition,
            device: body.device
          });
        }
        
        return NextResponse.json(
          { error: "Whitelist API not properly configured" },
          { status: 500 }
        );
      }
      
      // Basic Auth credentials encoded as base64
      const authHeader = 'Basic ' + Buffer.from(`${AUTH_USERNAME}:${AUTH_PASSWORD}`).toString('base64');
      
      console.log(`Calling whitelist API at ${WHITELIST_API_BASE}${WHITELIST_API_ROUTE}`);
      
      // Call the PittMC whitelist API with the proper route
      const response = await fetch(`${WHITELIST_API_BASE}${WHITELIST_API_ROUTE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          username: body.edition === "bedrock" ? body.username.replace(" ", "_") : body.username,
          type: body.edition
        }),
      });
      
      if (!response.ok) {
        console.error(`API returned status ${response.status}: ${await response.text()}`);
        
        // Update Discord webhook if sessionId is available
        if (body.sessionId) {
          await updateWhitelistWebhook(body.sessionId, WhitelistStep.Completed, {
            error: `API error: ${response.status}`,
            email,
            username: body.username,
            edition: body.edition,
            device: body.device
          });
        }
        
        throw new Error(`API returned ${response.status}`);
      }
      
      // Get response text
      const responseText = await response.text();
      
      let apiResponse: { status: string; response: string };
      try {
        // Try to parse as JSON
        apiResponse = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Failed to parse API response as JSON:", responseText);
        
        // Update Discord webhook if sessionId is available
        if (body.sessionId) {
          await updateWhitelistWebhook(body.sessionId, WhitelistStep.Completed, {
            error: "Invalid API response format",
            email,
            username: body.username,
            edition: body.edition,
            device: body.device
          });
        }
        
        throw new Error("Invalid API response format");
      }
      
      console.log(`API response: ${JSON.stringify(apiResponse)}`);
      
      // Map the API response to our response format
      if (apiResponse.status === "success" || apiResponse.status === "warning") {
        // If sessionId is available, update the Discord webhook
        if (body.sessionId) {
          await updateWhitelistWebhook(body.sessionId, WhitelistStep.Completed, {
            email,
            username: body.username,
            edition: body.edition,
            device: body.device
          });
        } else {
          // Fall back to the old Discord webhook method for compatibility
          await sendDiscordWebhook(email, body.username, body.edition, body.device);
        }
        
        return NextResponse.json({ 
          success: true,
          message: apiResponse.response,
          status: apiResponse.status,
          email: email,
          username: body.username,
          edition: body.edition
        });
      } else {
        // Update Discord webhook if sessionId is available
        if (body.sessionId) {
          await updateWhitelistWebhook(body.sessionId, WhitelistStep.Completed, {
            error: apiResponse.response || "Failed to whitelist user",
            email,
            username: body.username,
            edition: body.edition,
            device: body.device
          });
        }
        
        return NextResponse.json({ 
          success: false,
          error: apiResponse.response || "Failed to whitelist user",
          status: apiResponse.status
        }, { status: 400 });
      }
      
    } catch (error) {
      console.error("Error calling whitelist API:", error);
      
      // Update Discord webhook if sessionId is available
      if (body.sessionId) {
        await updateWhitelistWebhook(body.sessionId, WhitelistStep.Completed, {
          error: "Failed to whitelist user. The server will try to whitelist you manually.",
          email,
          username: body.username,
          edition: body.edition,
          device: body.device
        });
      }
      
      return NextResponse.json(
        { error: "Failed to whitelist user. The server will try to whitelist you manually." },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error in whitelist-request API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 