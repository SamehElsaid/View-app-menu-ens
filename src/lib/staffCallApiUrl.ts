/**
 * REST endpoint for guest "call staff" (same backend rules as Socket `guest:call_staff`).
 * Uses `NEXT_PUBLIC_BASE_URL` (e.g. http://localhost:4021/api → …/api/public/staff-call).
 */
export function getGuestStaffCallUrl(): string {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "").trim().replace(/\/$/, "");
  if (!base) return "";
  return `${base}/public/staff-call`;
}
