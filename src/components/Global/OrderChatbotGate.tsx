"use client";

import { useLocale } from "next-intl";
import OrderChatbot from "@/components/Global/OrderChatbot";
import { useAppSelector } from "@/store/hooks";
import { useAiChatCanOrder, useAiChatHasTable } from "@/hooks/useAiChatCanOrder";

/**
 * Renders AI chat only on Arabic menu pages.
 * Ordering UI: paid + ?table=. Free → discovery webhook; paid without table → ai-order webhook, browse UI only.
 */
export default function OrderChatbotGate() {
  const locale = useLocale();
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const canOrderViaChat = useAiChatCanOrder();
  const hasTable = useAiChatHasTable();

  if (locale !== "ar") {
    return null;
  }

  if (!menuInfo?.id) {
    return null;
  }

  const mode = canOrderViaChat ? "ordering" : "discovery";

  return (
    <OrderChatbot
      key={`${menuInfo.id}-${mode}-${hasTable ? "t" : "b"}`}
      mode={mode}
    />
  );
}
