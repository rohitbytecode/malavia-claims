import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../api/services";
import { useNotificationStore } from "../../store/notification.store";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotificationStore();

  const onRead = async (id: string) => {
    await notificationApi.markRead(id);
    markRead(id);
  };

  const onReadAll = async () => {
    await notificationApi.markAllRead();
    markAllRead();
  };

  return (
    <div style={{ position: "relative" }}>
      <button type="button" className="sidebar__icon-btn" onClick={() => setOpen((v) => !v)}>
        🔔 {unreadCount > 0 ? `(${unreadCount})` : ""}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 36, width: 360, maxHeight: 420, overflow: "auto", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, zIndex: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <strong>Notifications</strong>
            <button type="button" onClick={onReadAll}>Mark all read</button>
          </div>
          {notifications.length === 0 && <div>No notifications yet.</div>}
          {notifications.slice(0, 20).map((item) => (
            <div key={item._id} style={{ padding: 8, marginBottom: 8, borderRadius: 6, background: item.isRead ? "transparent" : "rgba(0,180,120,0.15)" }}>
              <div style={{ fontWeight: 600 }}>{item.title}</div>
              <div>{item.message}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
                <div>
                  {!item.isRead && <button type="button" onClick={() => onRead(item._id)}>Read</button>}
                  {item.entityId && (
                    <button type="button" onClick={() => navigate(`/claims/${item.entityId}`)}>
                      Open
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
