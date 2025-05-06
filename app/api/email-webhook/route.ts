import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface EmailWebhookPayload {
  from: string;
  to: string;
  subject?: string;
  text?: string;
  headers?: Record<string, string>;
  [key: string]: any;  // For other potential fields
}

export async function POST(request: NextRequest) {
  try {
    // Get KV namespace from Cloudflare context
    const { env } = getCloudflareContext();
    
    if (!env?.VERIFICATION_CODES) {
      console.error("KV namespace not available");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Parse the incoming Cloudflare email webhook payload
    const emailData = await request.json() as EmailWebhookPayload;
    
    // Basic validation of webhook payload
    if (!emailData || !emailData.from || !emailData.to) {
      console.error("Invalid email webhook payload");
      return NextResponse.json({ error: "Invalid email data" }, { status: 400 });
    }
    
    // Extract sender email (ensure lowercase for consistency)
    const senderEmail = emailData.from.toLowerCase();
    
    // Validate that this is a Pitt email
    if (!senderEmail.endsWith("@pitt.edu")) {
      console.log(`Rejected non-Pitt email: ${senderEmail}`);
      return NextResponse.json({ error: "Not a valid Pitt email" }, { status: 400 });
    }
    
    // Check if we're expecting a verification from this email
    const sessionId = await env.VERIFICATION_CODES.get(`awaiting:${senderEmail}`);
    
    if (!sessionId) {
      console.log(`No pending verification found for ${senderEmail}`);
      return NextResponse.json({ error: "No pending verification" }, { status: 400 });
    }
    
    // Store the verified status
    await env.VERIFICATION_CODES.put(`verified:${sessionId}`, senderEmail, { expirationTtl: 3600 }); // 1 hour expiration
    
    // Remove the awaiting status to prevent duplicate verifications
    await env.VERIFICATION_CODES.delete(`awaiting:${senderEmail}`);
    
    // Log successful verification
    console.log(`Email verified for ${senderEmail}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing email webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 