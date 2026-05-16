import { allowedTransitions } from "../../constants/workflow";
import { getWorkflowStages } from "../../constants/operations";
import type { Claim } from "../../types/domain";
import { labelize } from "../../utils/format";
import { StatusBadge } from "../ui/StatusBadge";

export function WorkflowRail({ claim }: { claim: Claim }) {
  const stages = getWorkflowStages(claim.type);
  const currentIndex = stages.findIndex((stage) => stage.id === claim.status);
  const next = allowedTransitions(claim.type, claim.status);

  return (
    <section className="workflow-rail premium-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Workflow map</p>
          <h2>{claim.type === "CASHLESS" ? "Cashless authorization flow" : "Reimbursement submission flow"}</h2>
        </div>
        <StatusBadge value={claim.status} />
      </div>
      <div className="stage-track">
        {stages.map((stage, index) => {
          const active = stage.id === claim.status;
          const complete = currentIndex >= 0 && index < currentIndex;
          const possible = next.includes(stage.id);
          return (
            <div className={`stage-node ${active ? "active" : ""} ${complete ? "complete" : ""} ${possible ? "possible" : ""}`} key={stage.id}>
              <div className="stage-dot" />
              <div>
                <strong>{stage.label}</strong>
                <span>{labelize(stage.group)}{stage.irreversible ? " · terminal" : ""}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="next-actions-strip">
        <span>Allowed backend transitions</span>
        <div className="chip-cloud">
          {next.length > 0 ? next.map((status) => <StatusBadge value={status} compact key={status} />) : <em>No further transitions</em>}
        </div>
      </div>
    </section>
  );
}
