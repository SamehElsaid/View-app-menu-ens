import type { AiOrderRequest, AiOrderResponse } from "@/types/aiOrder";

export async function sendAiOrderMessage(
  payload: AiOrderRequest,
): Promise<{ ok: boolean; data?: AiOrderResponse; rawText?: string; error?: string }> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_AI_ORDER_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return {
      ok: false,
      error:
        "Missing NEXT_PUBLIC_N8N_AI_ORDER_WEBHOOK_URL. Please set it in your environment.",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";
    const responseText = await response.text();

    if (!response.ok) {
      return {
        ok: false,
        error: `Webhook request failed (${response.status}).`,
        rawText: responseText,
      };
    }

    if (contentType.includes("application/json")) {
      try {
        return {
          ok: true,
          data: JSON.parse(responseText) as AiOrderResponse,
          rawText: responseText,
        };
      } catch {
        return {
          ok: true,
          data: { text: responseText },
          rawText: responseText,
        };
      }
    }

    return {
      ok: true,
      data: { text: responseText },
      rawText: responseText,
    };
  } catch (error) {
    console.error("[AI Order] Webhook error", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      ok: false,
      error: "Could not reach AI webhook. Please try again.",
    };
  }
}

export async function sendAiDiscoveryMessage(
  payload: AiOrderRequest,
): Promise<{ ok: boolean; data?: AiOrderResponse; rawText?: string; error?: string }> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_AI_DISCOVERY_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return {
      ok: false,
      error:
        "Missing NEXT_PUBLIC_N8N_AI_DISCOVERY_WEBHOOK_URL. Please set it in your environment.",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";
    const responseText = await response.text();

    if (!response.ok) {
      return {
        ok: false,
        error: `Webhook request failed (${response.status}).`,
        rawText: responseText,
      };
    }

    if (contentType.includes("application/json")) {
      try {
        return {
          ok: true,
          data: JSON.parse(responseText) as AiOrderResponse,
          rawText: responseText,
        };
      } catch {
        return {
          ok: true,
          data: { text: responseText },
          rawText: responseText,
        };
      }
    }

    return {
      ok: true,
      data: { text: responseText },
      rawText: responseText,
    };
  } catch (error) {
    console.error("[AI Discovery] Webhook error", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      ok: false,
      error: "Could not reach AI webhook. Please try again.",
    };
  }
}
