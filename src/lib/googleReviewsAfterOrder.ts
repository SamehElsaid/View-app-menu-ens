type Listener = () => void;

const listeners = new Set<Listener>();

/** Ask the Google Reviews CTA to show its after-order prompt (if configured). */
export function requestGoogleReviewsAfterOrderPrompt(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  });
}

export function subscribeGoogleReviewsAfterOrderPrompt(
  listener: Listener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
