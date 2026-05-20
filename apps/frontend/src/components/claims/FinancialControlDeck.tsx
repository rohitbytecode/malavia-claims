import type { Claim, Deposit, Settlement } from "../../types/domain";
import { formatCurrency, formatDateTime, labelize } from "../../utils/format";

export function FinancialControlDeck({
  claim,
  settlement,
  deposit,
}: {
  claim: Claim;
  settlement?: Settlement | null;
  deposit?: Deposit | null;
}) {
  const netPayable =
    settlement?.netPayable ??
    Math.max(
      0,
      claim.totalClaimAmount -
        (claim.deductions ?? 0) -
        (claim.tdsAmount ?? 0) -
        (claim.hospitalDiscount ?? 0)
    );

  const hasRefundRisk = deposit
    ? (deposit.refundAmount ?? 0) > (deposit.collectedAmount ?? 0)
    : false;

  return (
    <section className="financial-deck">
      <div className="deck-header">
        <div>
          <p className="eyebrow">FINANCIAL COMMAND DECK</p>
          <h2>Settlement · TDS · Deductions · Refunds</h2>
        </div>
        <div className="net-payable">
          <span className="net-label">Net Payable</span>
          <strong>{formatCurrency(netPayable)}</strong>
        </div>
      </div>

      <div className="finance-grid">
        <div className="finance-item">
          <span>Claimed amount</span>
          <strong>{formatCurrency(claim.totalClaimAmount)}</strong>
        </div>
        <div className="finance-item">
          <span>TDS</span>
          <strong>
            {formatCurrency(settlement?.tds ?? claim.tdsAmount ?? 0)}
          </strong>
        </div>
        <div className="finance-item">
          <span>Deductions</span>
          <strong>
            {formatCurrency(settlement?.deductions ?? claim.deductions ?? 0)}
          </strong>
        </div>
        <div className="finance-item">
          <span>Hospital discount</span>
          <strong>
            {formatCurrency(
              settlement?.hospitalDiscount ?? claim.hospitalDiscount ?? 0
            )}
          </strong>
        </div>

        <div className="finance-item">
          <span>Settlement method</span>
          <strong>{labelize(settlement?.settlementMethod) || "—"}</strong>
        </div>
        <div className="finance-item">
          <span>Settlement date</span>
          <strong>
            {settlement?.settlementDate
              ? formatDateTime(settlement.settlementDate)
              : "—"}
          </strong>
        </div>

        <div className={`finance-item ${hasRefundRisk ? "risk" : ""}`}>
          <span>Collected deposit</span>
          <strong>
            {formatCurrency(
              deposit?.collectedAmount ?? claim.depositAmount ?? 0
            )}
          </strong>
        </div>
        <div className={`finance-item ${hasRefundRisk ? "risk" : ""}`}>
          <span>Refund amount</span>
          <strong>
            {formatCurrency(deposit?.refundAmount ?? claim.refundAmount ?? 0)}
          </strong>
        </div>
      </div>

      <p className="validation-note">
        All calculations follow backend rules. Refunds cannot exceed collected
        deposits.
      </p>
    </section>
  );
}
