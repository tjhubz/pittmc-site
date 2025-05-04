import { NextRequest, NextResponse } from "next/server";

interface UsernameCheckRequest {
  username: string;
  edition: "java" | "bedrock";
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { username, edition } = await request.json() as UsernameCheckRequest;

    // Validate inputs
    if (!username || !edition) {
      return NextResponse.json(
        { valid: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate the username based on edition type
    if (edition === "java") {
      // Java usernames are 3-16 characters and only allow letters, numbers, and underscores
      if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
        return NextResponse.json(
          { valid: false, message: "Invalid Java username format - must be 3-16 characters and only contain letters, numbers, and underscores" },
          { status: 200 }
        );
      }
    } else if (edition === "bedrock") {
      // Bedrock usernames have different rules, but still limit length
      if (username.length < 1 || username.length > 16) {
        return NextResponse.json(
          { valid: false, message: "Invalid Bedrock username length - must be 1-16 characters" },
          { status: 200 }
        );
      }
    } else {
      return NextResponse.json(
        { valid: false, message: "Invalid edition type" },
        { status: 400 }
      );
    }

    // If we get here, username format is valid
    return NextResponse.json({ valid: true });
    
  } catch (error) {
    console.error("Error in check-username API:", error);
    return NextResponse.json(
      { valid: false, message: "Server error checking username" },
      { status: 500 }
    );
  }
} 