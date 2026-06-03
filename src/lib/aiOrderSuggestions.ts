/** Max product suggestion cards shown in OrderChatbot (performance + UX). */
export const MAX_ORDER_SUGGESTION_CARDS = 3;

export function capSuggestionList<T>(items: readonly T[]): T[] {
  return items.slice(0, MAX_ORDER_SUGGESTION_CARDS);
}
