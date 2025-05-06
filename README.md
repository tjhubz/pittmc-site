# PittMC Website

This is the official website for the University of Pittsburgh Minecraft Server (PittMC).

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Next.js API Routes
- **Deployment**: Cloudflare Workers (via OpenNext.js)
- **Data Storage**: Cloudflare KV (for verification codes)
- **Email Service**: Cloudflare Email Workers
- **Whitelist API**: Python FastAPI

## Architecture Overview

The application follows a modern JAMstack architecture:

- Static assets are served from Cloudflare's edge network
- Dynamic API routes run as Cloudflare Workers
- Cloudflare KV is used for storing email verification session data
- External Python API for server whitelist operations
- Cloudflare Email Workers for processing verification emails

## Email Verification Setup

The site uses Cloudflare Email Workers for email verification. To set up email verification, follow these steps:

1. Set up a [Cloudflare Email Workers](https://developers.cloudflare.com/email-routing/email-workers/) account
2. Configure the email domain in Cloudflare dashboard
3. Set up an email route from `verify@yourdomain.com` to the Email Workers function
4. Deploy the email webhook using the provided API endpoint

The verification process works as follows:
1. User enters their @pitt.edu email
2. Backend generates a session ID and awaits verification (valid for 30 minutes)
3. User sends an email from their @pitt.edu address to verify@pittmc.com
4. Cloudflare Email Workers processes the incoming email and verifies the sender
5. User checks verification status which then provides a token for whitelist requests
6. The UI provides clear feedback with a 10-second cooldown between status checks

## Whitelist API Setup

The site communicates with an external API to whitelist Minecraft usernames. To configure this integration:

1. Set the following environment variables in `wrangler.jsonc`:
   ```
   WHITELIST_API_USERNAME=your_api_username
   WHITELIST_API_PASSWORD=your_api_password
   WHITELIST_API_ROUTE=/your_api_route
   ```

## Cloudflare Setup

The project uses Cloudflare Workers and KV for deployment and data storage:

1. Create a Cloudflare account if you don't have one
2. Install Wrangler CLI: `npm install -g wrangler`
3. Login to Cloudflare: `wrangler login`
4. Create a KV namespace: `wrangler kv:namespace create VERIFICATION_CODES`
5. Add the namespace to your `wrangler.jsonc` file:
   ```json
   {
     "kv_namespaces": [
       {
         "binding": "VERIFICATION_CODES",
         "id": "your_namespace_id"
       }
     ]
   }
   ```

## Development Workflow

### Prerequisites

- Node.js 18+
- npm or yarn
- Wrangler CLI

### Local Development

```bash
# Install dependencies
npm install

# Generate Cloudflare type definitions
npm run cf-typegen

# Start the development server (Next.js)
npm run dev

# Test with Cloudflare Workers environment
npm run preview
```

When developing API routes that access Cloudflare KV, note that:

- KV is accessed through the Cloudflare context
- Use the `getCloudflareContext()` function from `@opennextjs/cloudflare` package
- Local development with `npm run dev` uses a mock KV implementation

### Deployment

The site is deployed on Cloudflare Workers using OpenNext.js.

```bash
# Build and deploy the site
npm run deploy
```

## Backend Implementation

The site uses Next.js App Router API routes running on Cloudflare Workers:

- `/api/send-verification` - Initializes a verification session and provides a session ID
- `/api/check-verification` - Checks if the email has been verified and generates a token
- `/api/email-webhook` - Processes incoming emails from Cloudflare Email Workers
- `/api/whitelist-user` - Processes whitelist requests with valid tokens

The API routes use the Cloudflare KV storage to:
1. Store session IDs with a 30-minute expiration time
2. Track email verification status
3. Generate and validate JWT tokens for secure whitelist requests

Example of KV usage in API routes:
```typescript
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Access KV in API routes
const { env } = getCloudflareContext();
await env.VERIFICATION_CODES.put(`awaiting:${email}`, sessionId, { expirationTtl: 1800 }); // 30-minute expiration
```

## Future Improvements

In a production implementation, consider:
1. Add proper error handling and logging
2. Implement rate limiting for verification checks
3. Add additional security measures for the verification process
4. Set up monitoring and alerts

## Environment Variables

The application requires the following environment variables:

- `WHITELIST_API_BASE` - The base URL for the API (default: "https://api.pittmc.com")
- `WHITELIST_API_ROUTE` - The API route for whitelist requests (REQUIRED, no default)
- `WHITELIST_API_USERNAME` - Username for API authentication (REQUIRED, no default)
- `WHITELIST_API_PASSWORD` - Password for API authentication (REQUIRED, no default)
- `DISCORD_WEBHOOK_URL` - Discord webhook URL for notifications (REQUIRED, no default)

⚠️ **IMPORTANT**: These environment variables have no fallback values in the code. The application will return an appropriate error if they are not set.

### Setting Up Environment Variables

#### Local Development
Create a `.env.local` file in the root directory with these variables:

```
WHITELIST_API_BASE=https://api.pittmc.com
WHITELIST_API_ROUTE=/your-api-route
WHITELIST_API_USERNAME=your-username
WHITELIST_API_PASSWORD=your-password
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

#### Production Deployment
For production deployment, copy `wrangler.jsonc.example` to `wrangler.jsonc` and add your environment variables:

```json
"vars": {
  "RESEND_API_KEY": "re_your_resend_key",
  "WHITELIST_API_BASE": "https://api.pittmc.com",
  "WHITELIST_API_USERNAME": "your-username",
  "WHITELIST_API_PASSWORD": "your-password",
  "WHITELIST_API_ROUTE": "/your-api-route",
  "DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/your-webhook-url"
}
``` 