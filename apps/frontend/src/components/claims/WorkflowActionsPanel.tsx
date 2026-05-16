import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimsApi } from "../../api/services";
import { allowedTransitions, canRoleTransition } from "../../constants/workflow";
import { canCloseClaims, canSeeFinance } from "../../constants/operations";
import { useAuthStore } from "../../store/auth.store";
import type { Claim, ClaimStatus } from "../../types/domain";
import { labelize } from "../../utils/format";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { ErrorPanel } from "../ui/ErrorPanel";

export function WorkflowActionsPanel({ claim }: { claim: Claim }) {
  const user = useAuthStore((state) => state.user);
  const qc = useQueryClient();
  const [target, setTarget] = useState<ClaimStatus>();
  const [remarks, setRemarks] = useState("");

  const transitions = useMemo(
    () => allowedTransitions(claim.type, claim.status).filter((status) => (user ? canRoleTransition(user.role, status) : false)),
    [claim.status, claim.type, user],
  );

  const mutation = useMutation({
    mutationFn: ({ status, reason }: { status: ClaimStatus; reason: string }) =>
      claimsApi.transition(claim._id, { toStatus: status, remarks: reason, performedBy: user?._id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["claim", claim._id] });
      qc.invalidateQueries({ queryKey: ["timeline", claim._id] });
      setTarget(undefined);
      setRemarks("");
    },
  });

  const closed = claim.status === "CLOSED";
  const statusNeedsFinance = target === "SETTLED";
  const closeBlocked = target === "CLOSED" && !canCloseClaims(user?.role);
  const financeBlocked = statusNeedsFinance && !canSeeFinance(user?.role);

  return (
    <aside className="action-panel premium-panel">
      <p className="eyebrow">Workflow action sidebar</p>
      <h2>{labelize(claim.status)}</h2>
      <div className="operator-context">
        <span>Operator</span>
        <strong>{user?.fullName ?? "Unknown"}</strong>
        <em>{user?.role ?? "No role"}</em>
      </div>

      {closed && (
        <div className="restriction">
          Backend workflow map marks CLOSED as terminal. No reopen endpoint exists, so the UI locks edits instead of inventing an unsafe override.
        </div>
      )}

      {!closed && transitions.map((status) => (
        <Button key={status} onClick={() => setTarget(status)} variant={status === "CLOSED" ? "danger" : status === "SETTLED" ? "secondary" : "primary"}>
          {labelize(status)}
        </Button>
      ))}

      {transitions.length === 0 && !closed && <div className="restriction">No permitted backend transition for your role at this stage.</div>}

      <div className="guardrail-list">
        <strong>Guardrails</strong>
        <span>Invalid transitions are hidden before submission.</span>
        <span>Every action requires an audit reason.</span>
        <span>Backend validation remains final authority.</span>
      </div>

      <Modal open={Boolean(target)} title="Audit confirmation required" onClose={() => setTarget(undefined)}>
        <div className="modal-body">
          <p>Confirm transition to <strong>{labelize(target)}</strong>. This action is sent to the backend workflow validator.</p>
          {closeBlocked && <div className="restriction">Your role cannot close claims.</div>}
          {financeBlocked && <div className="restriction">Settlement transitions are restricted to finance/admin roles.</div>}
          <textarea className="input textarea" value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Audit reason / operational remarks" />
          {remarks.length > 0 && remarks.length < 8 && <small className="field-error">Enter at least 8 characters.</small>}
          {mutation.isError && <ErrorPanel error={mutation.error} />}
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setTarget(undefined)}>Cancel</Button>
            <Button disabled={!target || remarks.length < 8 || closeBlocked || financeBlocked || mutation.isPending} onClick={() => target && mutation.mutate({ status: target, reason: remarks })}>
              {mutation.isPending ? "Updating..." : "Confirm transition"}
            </Button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
