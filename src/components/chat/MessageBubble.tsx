import { formatTime } from "../../utils/format";
import type { ChatMessage } from "../../utils/types";
import { MessageTicks } from "./MessageTicks";
import "./MessageBubble.css";

type MessageBubbleProps = {
  message: ChatMessage;
  /** Последнее сообщение в серии от одного отправителя — у него «хвостик». */
  isTail: boolean;
};

export function MessageBubble({ message, isTail }: MessageBubbleProps) {
  const outgoing = message.direction === "outgoing";

  return (
    <div
      className={[
        "bubble-row",
        outgoing ? "bubble-row--out" : "bubble-row--in",
        isTail ? "bubble-row--tail" : "",
      ].join(" ")}
    >
      <div className="bubble">
        <span className={`bubble__text${message.unsupported ? " bubble__text--muted" : ""}`}>
          {message.text}
        </span>

        <span className="bubble__meta">
          <time dateTime={new Date(message.timestamp).toISOString()}>
            {formatTime(message.timestamp)}
          </time>
          {outgoing && <MessageTicks status={message.status} />}
        </span>
      </div>
    </div>
  );
}
