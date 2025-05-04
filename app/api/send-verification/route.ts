import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateVerificationCode } from "@/lib/verification";
import { VerificationEmail } from "@/components/emails/verification-email";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Don't initialize Resend at module scope
// We'll create it inside the handler when we have access to env vars
let resend: Resend;

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

    // Generate a 6-digit verification code
    const verificationCode = generateVerificationCode();

    // Get KV namespace from Cloudflare context
    const { env } = getCloudflareContext();
    
    if (!env?.VERIFICATION_CODES) {
      console.error("KV namespace not available");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    // Initialize Resend with the API key from env
    if (!resend && env.RESEND_API_KEY) {
      resend = new Resend(env.RESEND_API_KEY);
    }
    
    if (!resend) {
      console.error("Resend API key not available");
      return NextResponse.json(
        { error: "Email service configuration error" },
        { status: 500 }
      );
    }

    // Store code with 15-minute expiration (900 seconds)
    await env.VERIFICATION_CODES.put(email, verificationCode, { expirationTtl: 900 });

    // Send email with verification code using React template
    const { data, error } = await resend.emails.send({
      from: "PittMC <help@pittmc.com>",
      to: email,
      subject: "Your Requested Pitt Minecraft Code",
      react: VerificationEmail({ verificationCode }) as React.ReactNode,
    });

    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in verification email API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 