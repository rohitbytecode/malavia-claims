import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../../store/notification.store";

export function NotificationToast() {
  const navigate = useNavigate();
  const { toasts, dismissToast } = useNotificationStore();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast._id), 5000)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [dismissToast, toasts]);

  return (
    <div style={{ position: "fixed", right: 16, top: 16, zIndex: 50, display: "grid", gap: 8 }}>
      {toasts.map((toast) => (
        <div key={toast._id} style={{ width: 320, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
          <strong>{toast.title}</strong>
          <p style={{ margin: "4px 0" }}>{toast.message}</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {toast.entityId ? (
              <button type="button" onClick={() => navigate(`/claims/${toast.entityId}`)}>
                View claim
              </button>
            ) : (
              <span />
            )}
            <button type="button" onClick={() => dismissToast(toast._id)}>
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
