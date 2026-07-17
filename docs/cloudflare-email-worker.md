# Cloudflare Email Worker

Use this Worker for the `swift-inbox-inbound` Email Worker in Cloudflare.

## Worker Variables

Configure these variables in Cloudflare for the Worker:

```text
BACKEND_INBOUND_URL=https://your-backend-domain.com/api/inbound/cloudflare
INBOUND_WEBHOOK_SECRET=<same as backend INBOUND_WEBHOOK_SECRET>
```

For local testing, expose the backend with a tunnel first, for example:

```powershell
cloudflared tunnel --url http://localhost:9000
```

Then set `BACKEND_INBOUND_URL` to:

```text
https://your-tunnel.trycloudflare.com/api/inbound/cloudflare
```

## Worker Code

```js
const MAX_EMAIL_BYTES = 5 * 1024 * 1024;
const BACKEND_TIMEOUT_MS = 15000;

async function streamToText(stream) {
  return await new Response(stream).text();
}

function getHeader(headers, name) {
  return headers.get(name) || headers.get(name.toLowerCase()) || null;
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch() {
    return new Response("Swift Inbox inbound worker is running", {
      status: 200,
    });
  },

  async email(message, env) {
    if (!env.BACKEND_INBOUND_URL || !env.INBOUND_WEBHOOK_SECRET) {
      message.setReject("Inbound worker is not configured");
      return;
    }

    if (message.rawSize > MAX_EMAIL_BYTES) {
      message.setReject("Message too large");
      return;
    }

    const raw = await streamToText(message.raw);
    const subject = getHeader(message.headers, "subject");

    const payload = {
      to: message.to,
      from: message.from,
      subject,
      textBody: raw,
      htmlBody: null,
      rawPayload: {
        headers: Object.fromEntries(message.headers),
        rawSize: message.rawSize,
        messageId: getHeader(message.headers, "message-id"),
        date: getHeader(message.headers, "date"),
        receivedAt: new Date().toISOString(),
      },
    };

    const response = await fetchWithTimeout(
      env.BACKEND_INBOUND_URL,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-inbound-secret": env.INBOUND_WEBHOOK_SECRET,
        },
        body: JSON.stringify(payload),
      },
      BACKEND_TIMEOUT_MS,
    );

    if (!response.ok) {
      message.setReject("Backend rejected inbound email");
    }
  },
};
```

## Notes

- The Worker sends raw MIME in `textBody`; the backend parses it into clean `subject`, `textBody`, and `htmlBody` before saving.
- Keep the raw headers in `rawPayload` for debugging delivery issues.
- The backend intentionally returns `200` with `accepted: false` for missing or expired mailboxes so Cloudflare does not retry those messages.
- When admin maintenance mode is enabled, the backend returns `503` for inbound mail and the Worker rejects the message with `Backend rejected inbound email`.
