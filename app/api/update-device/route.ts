import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { updateWhitelistWebhook, WhitelistStep } from "@/lib/discord-webhook";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { sessionId, device, edition } = await request.json() as { 
      sessionId: string;
      device: string;
      edition: "java" | "bedrock";
    };

    // Validate input
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
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

    // Update the Discord webhook
    const updated = await updateWhitelistWebhook(
      sessionId, 
      WhitelistStep.DeviceSelected, 
      { 
        device, 
        edition
      }
    );
    
    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update webhook" },
        { status: 500 }
      );
    }

    // Return success
    return NextResponse.json({ 
      success: true,
      message: "Device information updated"
    });
  } catch (error) {
    console.error("Error updating device information:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 