import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email } = await request.json() as { email: string };

    // Validate the email format
    if (!email || !email.endsWith("@pitt.edu")) {
      return NextResponse.json(
        { error: "Invalid email address. Must be a pitt.edu email." },
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
    
    // Generate a unique session ID for this verification attempt
    const sessionId = uuidv4();
    
    // Store the session ID with the email as the key (30-minute expiration)
    await env.VERIFICATION_CODES.put(`awaiting:${email.toLowerCase()}`, sessionId, { expirationTtl: 1800 });
    
    // Return the session ID to the client
    return NextResponse.json({ 
      success: true,
      sessionId,
      message: "Please send an email from your Pitt account to verify@pittmc.com"
    });
  } catch (error) {
    console.error("Error in email verification request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 