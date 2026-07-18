import { axiosPost } from "@/shared/axiosCall";

export type StaffRequestKind = "waiter" | "bill";

export type StaffServiceCallPayload = {
  menuId: number;
  type: "table";
  tableNumber: string;
  requestKind: StaffRequestKind;
};

export type StaffServiceCallError = {
  error?: string;
  message?: string;
  errorAr?: string;
  errorEn?: string;
};

export async function sendStaffServiceRequest(
  locale: string,
  payload: StaffServiceCallPayload,
) {
  return axiosPost<StaffServiceCallPayload, StaffServiceCallError>(
    "/public/staff-call",
    locale,
    payload,
    false,
    true,
  );
}
