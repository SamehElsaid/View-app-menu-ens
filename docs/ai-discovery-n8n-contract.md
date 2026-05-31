# AI Menu Discovery Chat — n8n contract (free plan)

Read-only assistant on **free-plan** Arabic menus only. Paid menus (including browse without `?table=`) use the [ai-order webhook](./ai-order-n8n-contract.md). Same payload shape; frontend uses `reply` + `suggestions` (cards without Add on free).

## Environment

```env
NEXT_PUBLIC_N8N_AI_DISCOVERY_WEBHOOK_URL=https://ensbot.net/webhook-test/LINAENSMENUFREE
```

`webhook-test/` URLs require the n8n test workflow to be listening. Use a production `/webhook/...` path when the workflow is published.

Premium ordering uses `NEXT_PUBLIC_N8N_AI_ORDER_WEBHOOK_URL` (see [ai-order-n8n-contract.md](./ai-order-n8n-contract.md)).

## Request payload (frontend → n8n)

```json
{
  "sessionId": "...",
  "message": "...",
  "source": "menu_discovery_chat",
  "locale": "ar",
  "direction": "rtl",
  "menuId": 123,
  "restaurantName": "Flower Cafe",
  "menuName": "Flower Cafe",
  "currency": "SAR",
  "currentCart": {},
  "menuCatalog": [{ "id": 211, "nameAr": "...", "price": 66 }]
}
```

- `source` is `menu_discovery_chat` on free menus only.
- `currentCart` is always `{}` (no cart is sent or updated from chat).
- `restaurantName` / `menuName` come from loaded `menuInfo` (same as ordering).
- **Quick chips** — up to 4 random menu category names; click sends the category name as `message` (same as premium).

## Response shape

Same JSON as ordering chat:

```json
{
  "reply": "أكيد 👌 دي اختيارات مناسبة:",
  "action": "reply",
  "suggestions": [
    {
      "itemId": 211,
      "name": "Product Name",
      "price": 66,
      "currency": "SAR",
      "image": "https://optional-image-url"
    }
  ]
}
```

## Fields the frontend uses

| Field | Used on free |
|-------|----------------|
| `reply` / `message` / `output` / `text` | Yes |
| `suggestions` | Yes (up to 3 cards, read-only — no Add button) |
| `cartActions` | **Ignored** |
| `cart` | **Ignored** |
| `action: confirm_order` | **Ignored** |
| `requiresConfirmation` | **Ignored** |

## Rules when `suggestions` is non-empty

1. Do not list item IDs in `reply`.
2. Put product data in `suggestions` objects (`itemId`, `name`, `price`, `currency`, optional `image`).
3. Keep `reply` short intro text, or empty if cards are enough.
4. Return `"cartActions": []` — discovery / browse UI has no Add button.
5. Frontend shows reply bubble + up to 3 cards (name, price, image; no quantity controls). Bare id arrays are enriched from the local menu.
6. Use `restaurantName` / `menuName` in prompts for branded menu Q&A.

## Legacy suggestions

Bare id arrays are accepted: `"suggestions": [211, 227]` — frontend enriches from the local menu. Prefer full objects.

## n8n workflow notes

- Do not return checkout or cart mutations; they have no effect on free menus.
- Discovery and ordering are separate webhooks and workflows.
- Session id is stored per menu and mode: `ensmenu_ai_discovery_session_{menuId}` vs `ensmenu_ai_order_session_{menuId}` (separate from paid ordering on another menu).
