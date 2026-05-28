import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, TextInput } from "../../components/forms/FormField";
import { ErrorPanel } from "../../components/ui/ErrorPanel";
import { Skeleton } from "../../components/ui/Skeleton";
import { advancedNotificationApi } from "../../api/services";
import { useAuthStore } from "../../store/auth.store";

export function AdvancedNotificationsPage() {
  const query = useQuery({
    queryKey: ["advanced-notifications"],
    queryFn: advancedNotificationApi.get,
  });

  if (query.isLoading) return <Skeleton rows={5} />;
  if (query.isError) return <ErrorPanel error={query.error} />;

  return (
    <AdvancedNotificationsForm
      initialEmail={query.data?.notificationEmail ?? ""}
      initialEnabled={query.data?.isEnabled ?? true}
    />
  );
}

function AdvancedNotificationsForm({
  initialEmail,
  initialEnabled,
}: {
  initialEmail: string;
  initialEnabled: boolean;
}) {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [notificationEmail, setNotificationEmail] = useState(initialEmail);
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      advancedNotificationApi.save({
        notificationEmail,
        isEnabled,
        updatedBy: currentUser?._id,
      }),
    onSuccess: (settings) => {
      setMessage("Advanced notification settings saved successfully.");
      setNotificationEmail(settings.notificationEmail);
      setIsEnabled(settings.isEnabled);
      queryClient.setQueryData(["advanced-notifications"], settings);
    },
    onError: () => {
      setMessage(null);
    },
  });

  return (
    <div className="page-stack">
      <div className="page-title">
        <p className="eyebrow">Super Admin control</p>
        <h1>Advanced Notifications</h1>
        <span>
          Configure the destination email for milestone claim notifications.
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <Card>
          <CardHeader
            title="Email notification panel"
            eyebrow="Pre-auth approved • final approved • settled"
          />
          <form
            className="card-pad"
            style={{ display: "grid", gap: "16px" }}
            onSubmit={(event) => {
              event.preventDefault();
              setMessage(null);
              save.mutate();
            }}
          >
            {message && (
              <div
                style={{
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "var(--green, #10b981)",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            )}

            {save.isError && <ErrorPanel error={save.error} />}

            <Field label="Notification email">
              <TextInput
                required
                type="email"
                placeholder="superadmin@example.com"
                value={notificationEmail}
                onChange={(event) => setNotificationEmail(event.target.value)}
              />
            </Field>

            <label
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                fontWeight: 700,
              }}
            >
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(event) => setIsEnabled(event.target.checked)}
              />
              Enable advanced email notifications
            </label>

            <div className="chip-cloud">
              <Button disabled={save.isPending}>
                {save.isPending ? "Saving..." : "Save notification email"}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Milestones" eyebrow="Automatic mail triggers" />
          <div className="card-pad" style={{ display: "grid", gap: "12px" }}>
            {[
              "Claim transition to Pre-Auth Approved",
              "Claim transition to Final Approved",
              "Claim transition to Settled",
            ].map((item) => (
              <div
                key={item}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "12px",
                  background: "var(--surface-muted)",
                }}
              >
                <strong>{item}</strong>
              </div>
            ))}
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              The configured email is used exactly as entered in this Super
              Admin panel whenever one of these statuses is recorded.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
