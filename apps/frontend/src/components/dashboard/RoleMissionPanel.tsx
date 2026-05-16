import { Link } from "react-router-dom";
import { roleExperiences } from "../../constants/operations";
import type { Role } from "../../types/domain";
import { StatusBadge } from "../ui/StatusBadge";

export function RoleMissionPanel({ role }: { role?: Role }) {
  const experience = role ? roleExperiences[role] : undefined;

  if (!experience) return null;

  return (
    <section className="mission-panel premium-panel">
      <div>
        <p className="eyebrow">Role-aware command profile</p>
        <h2>{experience.title}</h2>
        <p>{experience.mission}</p>
      </div>
      <div className="mission-grid">
        <div>
          <span>Primary queues</span>
          <div className="chip-cloud">
            {experience.primaryQueues.map((status) => (
              <Link to={`/claims?status=${status}`} key={status}>
                <StatusBadge value={status} compact />
              </Link>
            ))}
          </div>
        </div>
        <div>
          <span>Critical actions</span>
          <ul>
            {experience.criticalActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
        <div>
          <span>Guardrails</span>
          <ul>
            {experience.guardrails.map((guardrail) => (
              <li key={guardrail}>{guardrail}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
