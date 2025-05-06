import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { generateEmailToken } from "@/lib/verification";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email, sessionId } = await request.json() as { 
      email: string; 
      sessionId: string;
    };

    // Validate input
    if (!email || !email.endsWith("@pitt.edu") || !sessionId) {
      return NextResponse.json(
        { error: "Invalid email or session ID" },
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

    // Check if this session has been verified
    const verifiedEmail = await env.VERIFICATION_CODES.get(`verified:${sessionId}`);
    
    // If no verification found, return not verified status
    if (!verifiedEmail) {
      return NextResponse.json({ 
        verified: false,
        message: "Email verification pending"
      });
    }
    
    // Verify that the verified email matches the requested email
    if (verifiedEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email mismatch error" },
        { status: 400 }
      );
    }

    // Generate a JWT token for the verified email
    const token = await generateEmailToken(email, env);
    
    // Delete the verification record to prevent reuse
    await env.VERIFICATION_CODES.delete(`verified:${sessionId}`);

    // Return success with token
    return NextResponse.json({ 
      verified: true,
      message: "Email successfully verified",
      token
    });
  } catch (error) {
    console.error("Error checking verification status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 