import type { PropsWithChildren } from "react";
import { COPYRIGHT_NOTICE } from "../constants/legal";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="auth-layout">
      <div className="auth-brand">
        <p className="eyebrow">Malavia Hospital Confidential</p>
        <h1>Insurance Claims Operations</h1>
        <p>
          Cashless, reimbursement, settlement and audit workflows in one
          controlled hospital platform.
        </p>
        <p className="copyright-notice">{COPYRIGHT_NOTICE}</p>
      </div>
      {children}
    </main>
  );
}
