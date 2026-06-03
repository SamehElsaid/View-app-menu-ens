# AI Order Chat — n8n response contract

All **paid** menus send chat to `NEXT_PUBLIC_N8N_AI_ORDER_WEBHOOK_URL` (`menu_order_chat`), with or without `?table=`. Without `table`, the UI is browse-only (suggestion cards read-only, no Add, no checkout, `currentCart: {}`). Full ordering UI requires paid + `?table=`. **Free** menus use the discovery webhook — [ai-discovery-n8n-contract.md](./ai-discovery-n8n-contract.md).

## Response shape

```json
{
  "reply": "أكيد 👌 دي اختيارات مناسبة ليك:",
  "action": "reply",
  "requiresConfirmation": false,
  "cartActions": [],
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

## Rules when `suggestions` is non-empty

1. **Do not** put item IDs in `reply` (no lists, no JSON arrays like `["211", "227"]`).
2. Put product data only inside `suggestions` objects (`itemId`, `name`, `price`, `currency`, optional `image`).
3. Keep `reply` short intro text only (one or two lines), or empty string if cards are enough.
4. **Do not** use `cartActions` to add items from suggestions — return `"cartActions": []`.
5. The frontend renders **reply bubble first**, then up to 3 suggestion cards (both when `reply` and `suggestions` are present). Keep `reply` short/general; product names live in `suggestions`.
6. The frontend handles the Add button locally (real menu price).
7. The frontend does **not** show recovery/helper text — only your `reply` and cards.
8. The frontend does **not** classify food/category/recommendation intent locally (e.g. «عايز لحمة», «رشحلي», «اختارلي») — it always sends the user message to n8n.
9. Allowed locally: checkout/name capture, remove-from-cart phrases, last-item quantity bump, suggestion card UI + Add, cart cookie, `cartActions` / `cart` from n8n.
10. **Quick chips** — up to 4 random **menu category** names (`categoryNameAr` / `categoryNameEn` by locale). Click sends the category name as the user `message` to n8n (no local product picks). If no categories, generic shortcuts (رشحلي / اختارلي / …). Refresh on chat open and after each successful n8n reply.

## Rules when updating the cart without suggestions

- Use `cartActions` only when you are not returning suggestion cards.
- Example: user says "زود 2 من 211" with no suggestion UI → `cartActions` is appropriate.

## Request payload (frontend → n8n)

```json
{
  "sessionId": "...",
  "message": "...",
  "source": "menu_order_chat",
  "locale": "ar",
  "direction": "rtl",
  "menuId": 123,
  "restaurantName": "Flower Cafe",
  "menuName": "Flower Cafe",
  "currency": "SAR",
  "currentCart": { "211": 1 },
  "menuCatalog": [{ "id": 211, "nameAr": "...", "price": 66 }]
}
```

- `restaurantName` / `menuName` come from loaded `menuInfo` (no hardcoding). If API has no `restaurantName`, frontend sends `menuInfo.name` as `restaurantName` and also as `menuName`. If missing, both are `null`.
- `currency` defaults to `EGP` only when menu currency is absent.

## Legacy (temporary)

Bare id arrays are still accepted: `"suggestions": [211, 227, 233]` — the frontend enriches name/price/image from the local menu. Prefer full objects above.
