import { getCloudflareContext } from "@opennextjs/cloudflare";

// Discord webhook URL from environment variables
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Discord rate limits - avoid sending too many webhook requests
const RATE_LIMIT_DELAY_MS = 1000; // Wait 1 second between webhook calls
let lastWebhookCall = 0;

// Helper function to sleep/wait
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Helper to respect rate limits
async function respectRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastWebhookCall;
  
  if (timeSinceLastCall < RATE_LIMIT_DELAY_MS) {
    const waitTime = RATE_LIMIT_DELAY_MS - timeSinceLastCall;
    console.log(`Waiting ${waitTime}ms for Discord rate limit`);
    await sleep(waitTime);
  }
  
  lastWebhookCall = Date.now();
}

// Enum for the different whitelist process steps
export enum WhitelistStep {
  Started = 'started',
  Verified = 'verified',
  DeviceSelected = 'device_selected',
  UsernameEntered = 'username_entered',
  Completed = 'completed'
}

// Status colors
const COLORS = {
  STARTED: 16754432, // Orange
  IN_PROGRESS: 16776960, // Yellow
  COMPLETED: 5814783, // Green
  ERROR: 16711680 // Red
};

/**
 * Send a new webhook message for each step in the whitelist process
 * This replaces the updateWhitelistWebhook function to send a fresh message for each step
 */
export async function sendStepWebhook(
  sessionId: string,
  step: WhitelistStep,
  data: {
    email?: string;
    username?: string;
    edition?: string;
    device?: string;
    error?: string;
  } = {}
): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) {
    console.error("Discord webhook URL not configured");
    return false;
  }

  try {
    // Respect Discord rate limits
    await respectRateLimit();
    
    // Get the KV namespace
    const { env } = getCloudflareContext();
    
    if (!env?.VERIFICATION_CODES) {
      console.error("KV namespace not available");
      return false;
    }

    // Get any stored session info
    const storedDataStr = await env.VERIFICATION_CODES.get(`webhook:${sessionId}`);
    const storedData = storedDataStr ? JSON.parse(storedDataStr) : null;
    
    // Get email from stored data or from parameters
    const email = data.email || (storedData?.email || "Unknown");
    const startTime = storedData?.startTime || new Date().toISOString();
    
    // Create fields based on the current step and available data
    const fields = [];
    
    // Email field is always present
    fields.push({
      name: "Email",
      value: email,
      inline: true
    });
    
    // Session ID is always present
    fields.push({
      name: "Session ID",
      value: sessionId.substring(0, 8) + "...",
      inline: true
    });
    
    // Start time is always present
    fields.push({
      name: "Start Time",
      value: formatDate(startTime),
      inline: true
    });
    
    // Add edition if available
    if (data.edition) {
      fields.push({
        name: "Edition",
        value: data.edition,
        inline: true
      });
    }
    
    // Add username if available
    if (data.username) {
      fields.push({
        name: "Username",
        value: data.username,
        inline: true
      });
    }
    
    // Add device if available
    if (data.device) {
      fields.push({
        name: "Device",
        value: data.device,
        inline: true
      });
    }
    
    // Calculate the elapsed time if we have a start time
    if (startTime) {
      const elapsed = formatElapsedTime(startTime);
      fields.push({
        name: "Elapsed Time",
        value: elapsed,
        inline: true
      });
    }
    
    // Add a status field depending on the step
    let statusValue;
    if (data.error) {
      statusValue = `Error: ${data.error}`;
    } else {
      statusValue = getStatusMessage(step);
    }
    
    fields.push({
      name: "Status",
      value: statusValue,
      inline: false
    });
    
    // Create the webhook data
    const webhookData = {
      embeds: [{
        title: `Whitelist Process: ${formatStepName(step)}`,
        color: getColorForStep(step, !!data.error),
        fields,
        footer: {
          text: `Step ${getStepNumber(step)}/5: ${formatStepName(step)}`
        },
        timestamp: new Date().toISOString()
      }]
    };
    
    // Send the webhook
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      console.error(`Discord webhook error: ${response.status}`);
      return false;
    }
    
    // Update stored session data
    const updatedStoredData = storedData || {
      startTime: startTime,
      email: email,
      steps: {}
    };
    
    // Update steps data with the new step
    updatedStoredData.steps = updatedStoredData.steps || {};
    updatedStoredData.steps[step] = {
      timestamp: new Date().toISOString(),
      duration: 0
    };
    updatedStoredData.currentStep = step;
    
    // If we have new data, update the stored data
    if (data.email) updatedStoredData.email = data.email;
    if (data.username) updatedStoredData.username = data.username;
    if (data.edition) updatedStoredData.edition = data.edition;
    if (data.device) updatedStoredData.device = data.device;
    
    // Store the updated data
    await env.VERIFICATION_CODES.put(
      `webhook:${sessionId}`, 
      JSON.stringify(updatedStoredData), 
      { expirationTtl: 3600 } // 1 hour expiration
    );
    
    console.log(`Discord webhook sent for session ${sessionId}, step: ${step}`);
    return true;
  } catch (error) {
    console.error("Error sending Discord webhook:", error);
    return false;
  }
}

// Main function to send a webhook message for a whitelist session
export async function sendWhitelistWebhook(
  email: string,
  sessionId: string,
  step: WhitelistStep
): Promise<string | null> {
  if (!DISCORD_WEBHOOK_URL) {
    console.error("Discord webhook URL not configured");
    return null;
  }

  try {
    // Respect Discord rate limits
    await respectRateLimit();
    
    const startTime = new Date().toISOString();
    
    // Create the basic embed for the started step
    const webhookData = {
      embeds: [{
        title: `Whitelist Process: ${formatStepName(step)}`,
        color: COLORS.STARTED,
        fields: [
          {
            name: "Email",
            value: email,
            inline: true
          },
          {
            name: "Session ID",
            value: sessionId.substring(0, 8) + "...",
            inline: true
          },
          {
            name: "Start Time",
            value: formatDate(startTime),
            inline: true
          },
          {
            name: "Status",
            value: "Awaiting Email Verification",
            inline: false
          }
        ],
        footer: {
          text: `Step 1/5: ${formatStepName(step)}`
        },
        timestamp: startTime
      }]
    };

    // Send the webhook
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook error: ${response.status}`);
    }

    // Check if we have a content-length header
    const contentLength = response.headers.get('content-length');
    const hasContent = contentLength && parseInt(contentLength) > 0;
    
    let messageId: string | undefined;
    
    if (hasContent) {
      try {
        // Parse the response to get the message ID
        const data = await response.json() as { id: string };
        messageId = data.id;
        console.log('Discord webhook response:', data);
      } catch (error) {
        console.warn('Could not parse Discord webhook response:', error);
        // Continue with null message ID
      }
    }
    
    // If we couldn't get a messageId, generate a random one for tracking
    if (!messageId) {
      messageId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log('Using generated message ID:', messageId);
    }

    // Store the message ID and timing in KV store
    const { env } = getCloudflareContext();
    
    if (env?.VERIFICATION_CODES) {
      const webhookData = {
        messageId,
        startTime,
        email,
        steps: {
          [step]: {
            timestamp: startTime,
            duration: 0
          }
        },
        currentStep: step
      };
      
      await env.VERIFICATION_CODES.put(
        `webhook:${sessionId}`, 
        JSON.stringify(webhookData), 
        { expirationTtl: 3600 } // 1 hour expiration
      );
    }

    console.log(`Discord webhook sent for ${email}, message ID: ${messageId}`);
    return messageId;
  } catch (error) {
    console.error("Error sending Discord webhook:", error);
    return null;
  }
}

// Function to update an existing webhook message
export async function updateWhitelistWebhook(
  sessionId: string,
  step: WhitelistStep,
  data: {
    email?: string;
    username?: string;
    edition?: string;
    device?: string;
    error?: string;
  } = {}
): Promise<boolean> {
  // This function is maintained for backwards compatibility
  // but now simply calls sendStepWebhook to create a new message for each step
  return sendStepWebhook(sessionId, step, data);
}

// Helper functions
function formatStepName(step: WhitelistStep): string {
  switch (step) {
    case WhitelistStep.Started:
      return "Started";
    case WhitelistStep.Verified:
      return "Email Verified";
    case WhitelistStep.DeviceSelected:
      return "Device Selected";
    case WhitelistStep.UsernameEntered:
      return "Username Entered";
    case WhitelistStep.Completed:
      return "Completed";
    default:
      return "Unknown";
  }
}

function getStepNumber(step: WhitelistStep): number {
  switch (step) {
    case WhitelistStep.Started:
      return 1;
    case WhitelistStep.Verified:
      return 2;
    case WhitelistStep.DeviceSelected:
      return 3;
    case WhitelistStep.UsernameEntered:
      return 4;
    case WhitelistStep.Completed:
      return 5;
    default:
      return 0;
  }
}

function getColorForStep(step: WhitelistStep, isError: boolean): number {
  if (isError) return COLORS.ERROR;
  
  switch (step) {
    case WhitelistStep.Started:
      return COLORS.STARTED;
    case WhitelistStep.Completed:
      return COLORS.COMPLETED;
    default:
      return COLORS.IN_PROGRESS;
  }
}

function getStatusMessage(step: WhitelistStep): string {
  switch (step) {
    case WhitelistStep.Started:
      return "Awaiting Email Verification";
    case WhitelistStep.Verified:
      return "Email Verified, Selecting Device";
    case WhitelistStep.DeviceSelected:
      return "Device Selected, Entering Username";
    case WhitelistStep.UsernameEntered:
      return "Username Entered, Processing";
    case WhitelistStep.Completed:
      return "Whitelist Request Completed";
    default:
      return "Unknown";
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function formatElapsedTime(startTimeIso: string): string {
  const startTime = new Date(startTimeIso).getTime();
  const elapsedMs = Date.now() - startTime;
  
  const seconds = Math.floor(elapsedMs / 1000) % 60;
  const minutes = Math.floor(elapsedMs / (1000 * 60)) % 60;
  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
} 