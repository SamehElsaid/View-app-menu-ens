/**
 * Plan helpers — aligned with useTableCartAllowed and ENS free banner (Noir: missing plan = free).
 */
export function normalizeOwnerPlanType(plan?: string | null): string {
  return (plan ?? "").trim().toLowerCase();
}

/** Free tier: explicit "free" or absent/empty plan from API. */
export function isFreeMenuPlan(plan?: string | null): boolean {
  const normalized = normalizeOwnerPlanType(plan);
  return !normalized || normalized === "free";
}

export function isPaidMenuPlan(plan?: string | null): boolean {
  return !isFreeMenuPlan(plan);
}
