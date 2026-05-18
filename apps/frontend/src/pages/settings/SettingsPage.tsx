import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useUiStore } from "../../store/ui.store";
import { COPYRIGHT_NOTICE } from "../../constants/legal";

export function SettingsPage() {
  const { theme, toggleTheme } = useUiStore();
  return (
    <div className="page-stack">
      <div className="page-title">
        <p className="eyebrow">Operator preferences</p>
        <h1>Settings</h1>
        <span>Local workstation preferences persist across sessions.</span>
      </div>
      <Card>
        <CardHeader title="Theme" eyebrow="Clinical light / premium dark" />
        <p>
          Current theme: <strong>{theme}</strong>
        </p>
        <Button onClick={toggleTheme}>Switch theme</Button>
      </Card>
      <Card>
        <CardHeader
          title="Copyright and internal-use notice"
          eyebrow="Malavia Hospital confidential"
        />
        <p className="copyright-notice">{COPYRIGHT_NOTICE}</p>
      </Card>
    </div>
  );
}
