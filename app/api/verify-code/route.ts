import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { generateEmailToken } from "@/lib/verification";

// Use Cloudflare's environment interface
interface Env extends CloudflareEnv {}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email, code } = await request.json() as { email: string; code: string };

    // Validate input
    if (!email || !email.endsWith("@pitt.edu") || !code) {
      return NextResponse.json(
        { error: "Invalid email or verification code" },
        { status: 400 }
      );
    }

    // Validate code format (6-digit)
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid verification code format" },
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

    // Retrieve stored code from KV
    const storedCode = await env.VERIFICATION_CODES.get(email);
    
    // Check if code exists and matches
    if (!storedCode) {
      return NextResponse.json(
        { error: "Verification code expired or not found" },
        { status: 400 }
      );
    }

    // Validate the code
    const isValid = storedCode === code;

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Code is valid - delete it from KV to prevent reuse
    await env.VERIFICATION_CODES.delete(email);

    // Generate a JWT token for the verified email
    const token = await generateEmailToken(email, env);

    // Return success response with the token
    return NextResponse.json({ 
      success: true,
      message: "Email successfully verified",
      token
    });
  } catch (error) {
    console.error("Error in verification API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 