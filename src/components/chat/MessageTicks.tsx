import type { MessageStatus } from "../../utils/types";
import { AlertIcon, CheckIcon, ClockIcon, DoubleCheckIcon } from "../ui/Icons";
import "./MessageTicks.css";

const TITLES: Record<MessageStatus, string> = {
  pending: "Отправляется",
  sent: "Отправлено",
  delivered: "Доставлено",
  read: "Прочитано",
  failed: "Не доставлено",
};

export function MessageTicks({ status }: { status: MessageStatus }) {
  return (
    <span className={`ticks ticks--${status}`} title={TITLES[status]}>
      {status === "pending" && <ClockIcon size={13} />}
      {status === "failed" && <AlertIcon size={13} />}
      {status === "sent" && <CheckIcon size={15} />}
      {(status === "delivered" || status === "read") && <DoubleCheckIcon size={15} />}
    </span>
  );
}
