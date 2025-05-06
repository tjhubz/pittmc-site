import crypto from 'crypto';

/**
 * Generates a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  // Generate a random 6-digit number
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

/**
 * Validates that the email is a valid Pitt.edu email
 */
export function isValidPittEmail(email: string): boolean {
  if (!email) return false;
  
  // Check if the email ends with @pitt.edu
  return email.toLowerCase().endsWith('@pitt.edu');
}

// Store secret in KV for persistence across cold starts
export async function getJwtSecret(env: any): Promise<string> {
  let secret = await env.VERIFICATION_CODES.get('JWT_SECRET');
  if (!secret) {
    // Generate a new secret if one doesn't exist
    secret = crypto.randomBytes(32).toString('hex');
    await env.VERIFICATION_CODES.put('JWT_SECRET', secret, { expirationTtl: 86400 * 30 }); // 30 days
  }
  return secret;
}

/**
 * Generate a JWT token containing the verified email
 */
export async function generateEmailToken(email: string, env: any): Promise<string> {
  const secret = await getJwtSecret(env);
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Current time in seconds
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    email: email,
    iat: now,              // Issued at
    exp: now + 7200,       // Expires in 2 hours
    purpose: 'whitelist'   // Token purpose
  };
  
  // Encode header and payload
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  // Create signature
  const signature = crypto.createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  // Combine to form the JWT
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify a JWT token and extract the email if valid
 */
export async function verifyEmailToken(token: string, env: any): Promise<string | null> {
  const secret = await getJwtSecret(env);
  
  try {
    // Split the token into its parts
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      return null; // Invalid signature
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Token expired
    }
    
    // Check purpose
    if (payload.purpose !== 'whitelist') {
      return null; // Wrong token purpose
    }
    
    // Return the email
    return payload.email;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
} 