import { useMemo, useState } from "react";
import type { TimelineEvent } from "../../types/domain";
import { formatDate, formatDateTime, labelize, nameOf } from "../../utils/format";
import { StatusBadge } from "../ui/StatusBadge";

const eventIcon: Record<TimelineEvent["type"], string> = {
  STATUS: "↗",
  COMMUNICATION: "✉",
  DOCUMENT: "◫",
  SETTLEMENT: "₹",
  ALERT: "!",
  AUDIT: "⌁",
};

export function ClaimTimeline({ events }: { events: TimelineEvent[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const grouped = useMemo(() => {
    const sorted = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
      const key = formatDate(event.createdAt);
      acc[key] = [...(acc[key] ?? []), event];
      return acc;
    }, {});
  }, [events]);

  return (
    <div className="timeline cinematic-timeline">
      {Object.entries(grouped).map(([day, dayEvents]) => (
        <section className="timeline-day" key={day}>
          <div className="timeline-day-label">{day}</div>
          {dayEvents.map((event, index) => {
            const id = event.id ?? event._id ?? `${event.type}-${event.createdAt}-${index}`;
            const open = expanded[id] ?? index < 2;
            return (
              <article className={`timeline-item event-${event.type.toLowerCase()}`} key={id}>
                <div className="timeline-icon">{eventIcon[event.type]}</div>
                <button
                  className="timeline-content"
                  type="button"
                  onClick={() => setExpanded((state) => ({ ...state, [id]: !open }))}
                >
                  <div className="timeline-head">
                    <strong>{event.title ?? labelize(event.type)}</strong>
                    <time>{formatDateTime(event.createdAt)}</time>
                  </div>
                  <div className="timeline-meta">
                    {event.toStatus && <StatusBadge value={event.toStatus} compact />}
                    {event.severity && <StatusBadge value={event.severity} compact />}
                    <span>{nameOf(event.actor)}</span>
                  </div>
                  {open && (
                    <div className="timeline-expanded">
                      {event.fromStatus && event.toStatus && <p>{labelize(event.fromStatus)} → {labelize(event.toStatus)}</p>}
                      <p>{event.remarks ?? event.message ?? "No remarks recorded"}</p>
                      {event.attachmentName && <span className="secure-file">Secure attachment: {event.attachmentName}</span>}
                    </div>
                  )}
                </button>
              </article>
            );
          })}
        </section>
      ))}
      {events.length === 0 && <div className="empty-state">Timeline will populate from status history, communications, settlements, documents, alerts, and audit records.</div>}
    </div>
  );
}
