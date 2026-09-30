import { useEffect, useRef } from "react";
import { formatDayDivider, isSameDay } from "../../utils/format";
import type { ChatMessage } from "../../utils/types";
import { MessageBubble } from "./MessageBubble";
import "./MessageList.css";

type MessageListProps = {
  messages: ChatMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const firstRender = lastCountRef.current === 0;
    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    // Не дёргаем ленту, если пользователь читает историю выше
    const shouldScroll = firstRender || distanceToBottom < 200;
    lastCountRef.current = messages.length;

    if (shouldScroll) {
      bottomRef.current?.scrollIntoView({ behavior: firstRender ? "auto" : "smooth" });
    }
  }, [messages]);

  return (
    <div className="messages" ref={containerRef}>
      <div className="messages__inner">
        {messages.length === 0 && (
          <p className="messages__placeholder">
            Здесь пока пусто. Отправьте первое сообщение — ответы появятся автоматически.
          </p>
        )}

        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const next = messages[index + 1];
          const showDivider = !previous || !isSameDay(previous.timestamp, message.timestamp);
          const isTail = !next || next.direction !== message.direction;

          return (
            <div key={message.id}>
              {showDivider && (
                <div className="messages__divider">
                  <span>{formatDayDivider(message.timestamp)}</span>
                </div>
              )}

              <MessageBubble message={message} isTail={isTail} />
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
