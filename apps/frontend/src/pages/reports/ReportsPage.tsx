import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  reportApi,
  patientApi,
  doctorApi,
  departmentApi,
} from "../../api/services";
import { ErrorPanel } from "../../components/ui/ErrorPanel";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatCurrency, labelize } from "../../utils/format";
import { exportReportToCSV } from "../../utils/export";
import { useAuthStore } from "../../store/auth.store";

// Sub-components
import { ReportFilters } from "./components/ReportFilters";
import { ClaimsSummary } from "./components/ClaimsSummary";
import { DetailedClaimsTable } from "./components/DetailedClaimsTable";
import { DepartmentReportTable } from "./components/DepartmentReportTable";
import { InsurancePerformanceTable } from "./components/InsurancePerformanceTable";
import { SettlementReviewTable } from "./components/SettlementReviewTable";
import { HospitalShareTable } from "./components/HospitalShareTable";
import { APP_CONFIG } from "../../../../backend/src/config/app";

// Type definitions
import type {
  ReportSummaryRow,
  DetailedClaim,
  InsurancePerformanceRow,
  SettlementReportData,
} from "../../types/reports";

const HOSPITAL_NAME = APP_CONFIG.ORG_NAME;

const REPORT_TABS = [
  { id: "claims-summary", label: "Claims Summary" },
  { id: "detailed-claims", label: "Detailed Claims" },
  { id: "department-report", label: "Department-wise Report" },
  { id: "insurance-performance", label: "Insurance Company Performance" },
  { id: "settlement-review", label: "Settlement Financial Review" },
  { id: "hospital-share", label: "Hospital Share & Vendor Payout" },
] as const;

type TabId = (typeof REPORT_TABS)[number]["id"];

function buildPrintStyle(activeTab: TabId): string {
  return REPORT_TABS.map(({ id }) =>
    id !== activeTab
      ? `@media print { [data-report-tab="${id}"] { display: none !important; } }`
      : ""
  ).join("\n");
}

function ReportGeneratedTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(new Date().toLocaleString("en-IN"));
  }, []);
  return <div>{time ? `Generated ${time}` : ""}</div>;
}

export function ReportsPage() {
  const now = new Date();
  const user = useAuthStore((s) => s.user);
  const isPharmacist = user?.role === "PHARMACIST";

  const [activeTab, setActiveTab] = useState<TabId>("claims-summary");

  const [reportMode, setReportMode] = useState<
    "monthly" | "calendar" | "financial" | "custom"
  >("monthly");
  const [monthlyYear, setMonthlyYear] = useState(() =>
    new Date().getFullYear()
  );
  const [monthlyMonth, setMonthlyMonth] = useState(
    () => new Date().getMonth() + 1
  );
  const [calendarYear, setCalendarYear] = useState(() =>
    new Date().getFullYear()
  );

  const defaultFinancialYear =
    now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const [financialYear, setFinancialYear] = useState(defaultFinancialYear);

  const [startYear, setStartYear] = useState(() => new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(() => new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(() => new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(() => new Date().getMonth() + 1);

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      claimNo: true,
      patientId: true,
      patientName: true,
      doctorName: true,
      department: true,
      type: true,
      status: true,
      claimAmount: true,
      deposit: true,
    }
  );

  const { queryYear, queryMonth, queryEndYear, queryEndMonth } = useMemo(() => {
    switch (reportMode) {
      case "monthly":
        return {
          queryYear: monthlyYear,
          queryMonth: monthlyMonth,
          queryEndYear: undefined,
          queryEndMonth: undefined,
        };
      case "calendar":
        return {
          queryYear: calendarYear,
          queryMonth: 1,
          queryEndYear: calendarYear,
          queryEndMonth: 12,
        };
      case "financial":
        return {
          queryYear: financialYear,
          queryMonth: 4,
          queryEndYear: financialYear + 1,
          queryEndMonth: 3,
        };
      case "custom":
        return {
          queryYear: startYear,
          queryMonth: startMonth,
          queryEndYear: endYear,
          queryEndMonth: endMonth,
        };
    }
  }, [
    reportMode,
    monthlyYear,
    monthlyMonth,
    calendarYear,
    financialYear,
    startYear,
    startMonth,
    endYear,
    endMonth,
  ]);

  const periodLabel = useMemo(() => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    switch (reportMode) {
      case "monthly":
        return `${monthNames[monthlyMonth - 1]} ${monthlyYear}`;
      case "calendar":
        return `Calendar Year ${calendarYear} (January - December)`;
      case "financial":
        return `Financial Year ${financialYear}-${(financialYear + 1).toString().slice(-2)} (April ${financialYear} - March ${financialYear + 1})`;
      case "custom":
        return `${monthNames[startMonth - 1]} ${startYear} to ${monthNames[endMonth - 1]} ${endYear}`;
    }
  }, [
    reportMode,
    monthlyMonth,
    monthlyYear,
    calendarYear,
    financialYear,
    startMonth,
    startYear,
    endMonth,
    endYear,
  ]);

  const periodShortLabel = useMemo(() => {
    switch (reportMode) {
      case "monthly":
        return `${monthlyMonth.toString().padStart(2, "0")}/${monthlyYear}`;
      case "calendar":
        return `CY ${calendarYear}`;
      case "financial":
        return `FY ${financialYear}-${(financialYear + 1).toString().slice(-2)}`;
      case "custom":
        return `${startMonth.toString().padStart(2, "0")}/${startYear} - ${endMonth.toString().padStart(2, "0")}/${endYear}`;
    }
  }, [
    reportMode,
    monthlyMonth,
    monthlyYear,
    calendarYear,
    financialYear,
    startMonth,
    startYear,
    endMonth,
    endYear,
  ]);

  const monthly = useQuery({
    queryKey: [
      "reports",
      "monthly",
      reportMode,
      queryYear,
      queryMonth,
      queryEndYear,
      queryEndMonth,
    ],
    queryFn: () =>
      reportApi.monthly(queryYear, queryMonth, queryEndYear, queryEndMonth),
  });

  const insurance = useQuery<InsurancePerformanceRow[]>({
    queryKey: ["reports", "insurance"],
    queryFn: reportApi.insurancePerformance as any,
  });

  const settlementReport = useQuery<SettlementReportData>({
    queryKey: [
      "reports",
      "settlement",
      reportMode,
      queryYear,
      queryMonth,
      queryEndYear,
      queryEndMonth,
    ],
    queryFn: () =>
      reportApi.settlementReport(
        queryYear,
        queryMonth,
        queryEndYear,
        queryEndMonth
      ) as any,
  });

  const hospitalShare = useQuery({
    queryKey: [
      "reports",
      "hospital-share",
      reportMode,
      queryYear,
      queryMonth,
      queryEndYear,
      queryEndMonth,
    ],
    queryFn: () =>
      reportApi.hospitalShareReport(
        queryYear,
        queryMonth,
        queryEndYear,
        queryEndMonth
      ),
  });

  const patient = useQuery<ReportSummaryRow[]>({
    queryKey: ["reports", "patient", appliedSearchTerm],
    enabled: appliedSearchTerm.length > 0,
    queryFn: () => reportApi.patientClaims(appliedSearchTerm) as any,
  });

  const patientsQuery = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientApi.list({ limit: 100 }),
  });
  const doctorsQuery = useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorApi.list({ limit: 100 }),
  });
  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentApi.list({ limit: 100 }),
  });

  const patientMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of patientsQuery.data?.data ?? []) {
      map.set(p._id, p.name);
      map.set(p.id, p.name);
      map.set(p.patientId, p.name);
    }
    return map;
  }, [patientsQuery.data]);

  const doctorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of doctorsQuery.data?.data ?? []) {
      map.set(d._id, d.name);
      map.set(d.id, d.name);
    }
    return map;
  }, [doctorsQuery.data]);

  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of departmentsQuery.data?.data ?? []) {
      map.set(d._id, d.name);
    }
    return map;
  }, [departmentsQuery.data]);

  const monthlyData = monthly.data as any;

  const filteredDetailedClaims = useMemo<DetailedClaim[]>(() => {
    const claims = Array.isArray(monthlyData?.detailedClaims)
      ? monthlyData.detailedClaims
      : [];
    if (!appliedSearchTerm) return claims;
    const term = appliedSearchTerm.toLowerCase().trim();
    return claims.filter((claim: DetailedClaim) => {
      const pName = (
        patientMap.get(claim.patientId) ||
        claim.patientName ||
        ""
      ).toLowerCase();
      const dName = (
        doctorMap.get(claim.doctorId) ||
        (typeof claim.doctor === "object" && claim.doctor?.name) ||
        ""
      ).toLowerCase();
      const deptName = (
        departmentMap.get(claim.departmentId) ||
        (typeof claim.department === "object" && claim.department?.name) ||
        ""
      ).toLowerCase();
      return (
        claim.claimNumber?.toLowerCase().includes(term) ||
        claim.claimId?.toLowerCase().includes(term) ||
        claim.patientId?.toLowerCase().includes(term) ||
        pName.includes(term) ||
        dName.includes(term) ||
        deptName.includes(term) ||
        claim.type?.toLowerCase().includes(term) ||
        claim.status?.toLowerCase().includes(term)
      );
    });
  }, [
    monthlyData?.detailedClaims,
    appliedSearchTerm,
    patientMap,
    doctorMap,
    departmentMap,
  ]);

  const summary = useMemo<ReportSummaryRow[]>(() => {
    if (!appliedSearchTerm) {
      const rawSummary = monthlyData?.summary ?? monthlyData;
      return Array.isArray(rawSummary) ? rawSummary : [];
    }
    const statusMap = new Map<string, { count: number; totalAmount: number }>();
    for (const claim of filteredDetailedClaims) {
      const status = claim.status || "UNKNOWN";
      const current = statusMap.get(status) || { count: 0, totalAmount: 0 };
      current.count += 1;
      current.totalAmount += claim.totalClaimAmount || 0;
      statusMap.set(status, current);
    }
    return Array.from(statusMap.entries()).map(([status, val]) => ({
      _id: status,
      count: val.count,
      totalAmount: val.totalAmount,
    }));
  }, [monthlyData, filteredDetailedClaims, appliedSearchTerm]);

  const detailedClaims = filteredDetailedClaims;

  const totalClaims = useMemo<number>(() => {
    return detailedClaims.length;
  }, [detailedClaims]);

  const totalAmount = useMemo<number>(() => {
    return detailedClaims.reduce(
      (sum: number, r: DetailedClaim) => sum + (r.totalClaimAmount ?? 0),
      0
    );
  }, [detailedClaims]);

  const sData = settlementReport.data;

  const filteredSettlements = useMemo(() => {
    const list = sData?.settlements || [];
    if (!appliedSearchTerm) return list;
    const term = appliedSearchTerm.toLowerCase().trim();
    return list.filter((s: any) => {
      const pName = (patientMap.get(s.patientId) || "").toLowerCase();
      const deptName = (departmentMap.get(s.departmentId) || "").toLowerCase();
      return (
        s.claimNumber?.toLowerCase().includes(term) ||
        s.claimId?.toLowerCase().includes(term) ||
        s.patientId?.toLowerCase().includes(term) ||
        pName.includes(term) ||
        deptName.includes(term) ||
        s.insuranceCompany?.toLowerCase().includes(term) ||
        s.settlementMethod?.toLowerCase().includes(term)
      );
    });
  }, [sData?.settlements, appliedSearchTerm, patientMap, departmentMap]);

  const filteredSettlementTotals = useMemo(() => {
    return filteredSettlements.reduce(
      (acc: any, s: any) => {
        acc.totalApproved += s.approvedAmount || 0;
        acc.totalDeductions += s.deductions || 0;
        acc.totalTds += s.tds || 0;
        acc.totalHospitalDiscount += s.hospitalDiscount || 0;
        acc.totalNetPayable += s.netPayable || 0;
        acc.totalClaimAmount += s.totalClaimAmount || 0;
        return acc;
      },
      {
        totalApproved: 0,
        totalDeductions: 0,
        totalTds: 0,
        totalHospitalDiscount: 0,
        totalNetPayable: 0,
        totalClaimAmount: 0,
      }
    );
  }, [filteredSettlements]);

  const filteredHospitalShareRows = useMemo(() => {
    const list = hospitalShare.data?.rows || [];
    if (!appliedSearchTerm) return list;
    const term = appliedSearchTerm.toLowerCase().trim();
    return list.filter((r: any) => {
      return (
        r.claimNumber?.toLowerCase().includes(term) ||
        r.claimId?.toLowerCase().includes(term) ||
        r.insuranceCompany?.toLowerCase().includes(term)
      );
    });
  }, [hospitalShare.data?.rows, appliedSearchTerm]);

  const filteredHospitalShareTotals = useMemo(() => {
    return filteredHospitalShareRows.reduce(
      (acc: any, r: any) => {
        acc.totalApproved += r.approvedAmount || 0;
        acc.totalNetPayable += r.netPayable || 0;
        acc.totalPharmacyShare += r.pharmacyShare || 0;
        acc.totalLabShare += r.labShare || 0;
        acc.totalRadiologyShare += r.radiologyShare || 0;
        acc.totalVendorPayout += r.vendorPayout || 0;
        acc.totalHospitalShare += r.hospitalShare || 0;
        return acc;
      },
      {
        totalApproved: 0,
        totalNetPayable: 0,
        totalPharmacyShare: 0,
        totalLabShare: 0,
        totalRadiologyShare: 0,
        totalVendorPayout: 0,
        totalHospitalShare: 0,
      }
    );
  }, [filteredHospitalShareRows]);

  const filteredInsuranceData = useMemo(() => {
    const list = insurance.data || [];
    if (!appliedSearchTerm) return list;
    const term = appliedSearchTerm.toLowerCase().trim();
    return list.filter((row) => row.companyName?.toLowerCase().includes(term));
  }, [insurance.data, appliedSearchTerm]);

  const departmentReportData = useMemo(() => {
    const list = filteredSettlements;
    const groupsMap = new Map<
      string,
      {
        departmentId: string;
        departmentName: string;
        rows: any[];
        totals: {
          approvedAmount: number;
          deductions: number;
          tds: number;
          pharmacy: number;
          lab: number;
          radiology: number;
          others: number;
          netPayable: number;
        };
      }
    >();

    for (const s of list) {
      const deptId = s.departmentId || "unknown";
      const deptName = departmentMap.get(deptId) || "General / Other";

      let pharmacy = 0;
      let lab = 0;
      let radiology = 0;
      let others = 0;

      for (const item of s.departmentBreakdown || []) {
        if (item.departmentCategory === "PHARMACY") {
          pharmacy = item.netAmount ?? 0;
        } else if (item.departmentCategory === "LABORATORY") {
          lab = item.netAmount ?? 0;
        } else if (item.departmentCategory === "RADIOLOGY") {
          radiology = item.netAmount ?? 0;
        } else {
          others += item.netAmount ?? 0;
        }
      }

      let group = groupsMap.get(deptId);
      if (!group) {
        group = {
          departmentId: deptId,
          departmentName: deptName,
          rows: [],
          totals: {
            approvedAmount: 0,
            deductions: 0,
            tds: 0,
            pharmacy: 0,
            lab: 0,
            radiology: 0,
            others: 0,
            netPayable: 0,
          },
        };
        groupsMap.set(deptId, group);
      }

      group.rows.push({
        claimId: s.claimId,
        claimNumber: s.claimNumber,
        patientId: s.patientId,
        patientName: patientMap.get(s.patientId) || "Unknown",
        approvedAmount: s.approvedAmount || 0,
        deductions: s.deductions || 0,
        tds: s.tds || 0,
        pharmacy,
        lab,
        radiology,
        others,
        netPayable: s.netPayable || 0,
      });

      group.totals.approvedAmount += s.approvedAmount || 0;
      group.totals.deductions += s.deductions || 0;
      group.totals.tds += s.tds || 0;
      group.totals.pharmacy += pharmacy;
      group.totals.lab += lab;
      group.totals.radiology += radiology;
      group.totals.others += others;
      group.totals.netPayable += s.netPayable || 0;
    }

    const groups = Array.from(groupsMap.values()).sort((a, b) =>
      a.departmentName.localeCompare(b.departmentName)
    );

    const grandTotals = groups.reduce(
      (acc: any, g: any) => {
        acc.approvedAmount += g.totals.approvedAmount;
        acc.deductions += g.totals.deductions;
        acc.tds += g.totals.tds;
        acc.pharmacy += g.totals.pharmacy;
        acc.lab += g.totals.lab;
        acc.radiology += g.totals.radiology;
        acc.others += g.totals.others;
        acc.netPayable += g.totals.netPayable;
        return acc;
      },
      {
        approvedAmount: 0,
        deductions: 0,
        tds: 0,
        pharmacy: 0,
        lab: 0,
        radiology: 0,
        others: 0,
        netPayable: 0,
      }
    );

    return { groups, grandTotals };
  }, [filteredSettlements, departmentMap, patientMap]);

  const sharedExportBase = {
    periodLabel,
    totalClaims,
    totalAmount,
    summary,
    patientMap,
    doctorMap,
    departmentMap,
    reportMode,
    monthlyYear,
    monthlyMonth,
    calendarYear,
    financialYear,
    startYear,
    startMonth,
    endYear,
    endMonth,
  } as const;

  const exportHandlers: Record<TabId, (() => void) | null> = {
    "claims-summary": () =>
      exportReportToCSV({
        ...sharedExportBase,
        insuranceData: [],
        settlements: [],
        settlementTotals: emptySettlementTotals,
        settlementCount: 0,
        detailedClaims: [],
        visibleColumns,
        exportScope: "claims-summary",
      }),

    "detailed-claims":
      detailedClaims.length > 0
        ? () =>
            exportReportToCSV({
              ...sharedExportBase,
              insuranceData: [],
              settlements: [],
              settlementTotals: emptySettlementTotals,
              settlementCount: 0,
              detailedClaims,
              visibleColumns,
              exportScope: "detailed-claims",
            })
        : null,

    "department-report": () =>
      exportReportToCSV({
        ...sharedExportBase,
        insuranceData: [],
        settlements: [],
        settlementTotals: emptySettlementTotals,
        settlementCount: 0,
        detailedClaims: [],
        visibleColumns,
        departmentReportData,
        exportScope: "department-report",
      }),

    "insurance-performance": () =>
      exportReportToCSV({
        ...sharedExportBase,
        insuranceData: filteredInsuranceData,
        settlements: [],
        settlementTotals: emptySettlementTotals,
        settlementCount: 0,
        detailedClaims: [],
        visibleColumns,
        exportScope: "insurance-performance",
      }),

    "settlement-review": () =>
      exportReportToCSV({
        ...sharedExportBase,
        insuranceData: [],
        settlements: filteredSettlements,
        settlementTotals: filteredSettlementTotals,
        settlementCount: filteredSettlements.length,
        detailedClaims: [],
        visibleColumns,
        exportScope: "settlement-review",
      }),

    "hospital-share": () =>
      exportReportToCSV({
        ...sharedExportBase,
        insuranceData: [],
        settlements: [],
        settlementTotals: emptySettlementTotals,
        settlementCount: 0,
        detailedClaims: [],
        visibleColumns,
        hospitalShareData: {
          rows: filteredHospitalShareRows,
          totals: filteredHospitalShareTotals,
          count: filteredHospitalShareRows.length,
        },
        exportScope: "hospital-share",
      }),
  };

  const handlePrint = () => {
    let styleEl = document.getElementById(
      "report-print-style"
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "report-print-style";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = buildPrintStyle(activeTab);
    window.print();
  };

  const activeTabLabel =
    REPORT_TABS.find((t) => t.id === activeTab)?.label ?? "";

  if (isPharmacist) {
    return (
      <div className="page-stack">
        <div className="page-title">
          <p className="eyebrow">Audit-ready reporting</p>
          <h1>Reports &amp; PDF Preview</h1>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "32px 16px",
          }}
        >
          <svg
            width="100%"
            viewBox="0 0 680 420"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            style={{ maxWidth: 680 }}
          >
            <title>Under construction</title>
            <desc>
              Animated under construction banner for the Reports &amp; PDF
              Preview section
            </desc>
            <defs>
              <style>{`
            .crane-arm { transform-origin: 220px 80px; animation: swing 3s ease-in-out infinite; }
            @keyframes swing { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
            .hook { animation: hookbob 3s ease-in-out infinite; }
            @keyframes hookbob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
            .gear1 { transform-origin: 420px 210px; animation: spin1 4s linear infinite; }
            @keyframes spin1 { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            .gear2 { transform-origin: 456px 210px; animation: spin2 4s linear infinite; }
            @keyframes spin2 { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
            .blink { animation: blink 1.2s step-end infinite; }
            @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
            .progress-fill { animation: progress 2.8s ease-in-out infinite; }
            @keyframes progress { 0%{width:28px} 50%{width:280px} 100%{width:28px} }
            .hard-hat { animation: hatbob 3s ease-in-out infinite; transform-origin: 340px 195px; }
            @keyframes hatbob { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-5px) rotate(-3deg)} }
            .stripe { animation: stripeMove 1s linear infinite; }
            @keyframes stripeMove { from{transform:translateX(0)} to{transform:translateX(20px)} }
            .wrench { transform-origin: 570px 260px; animation: wrench 2s ease-in-out infinite; }
            @keyframes wrench { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(20deg)} }
          `}</style>
            </defs>

            {/* Background dots */}
            <defs>
              <pattern
                id="dots"
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="12" cy="12" r="1.5" fill="#888" />
              </pattern>
            </defs>
            <rect width="680" height="420" fill="url(#dots)" opacity="0.06" />

            {/* Caution stripe — top */}
            <clipPath id="stripe-clip-top">
              <rect x="0" y="0" width="680" height="14" />
            </clipPath>
            <g clipPath="url(#stripe-clip-top)">
              <g className="stripe">
                <rect
                  x="-20"
                  y="0"
                  width="720"
                  height="14"
                  fill="#FAC775"
                  opacity="0.9"
                />
                {Array.from({ length: 37 }, (_, i) => (
                  <polygon
                    key={i}
                    points={`${-20 + i * 20},0 ${i * 20},0 ${-20 + i * 20},14 ${(i - 1) * 20},14`}
                    fill="#2C2C2A"
                    opacity="0.55"
                  />
                ))}
              </g>
            </g>

            {/* Caution stripe — bottom */}
            <clipPath id="stripe-clip-bot">
              <rect x="0" y="406" width="680" height="14" />
            </clipPath>
            <g clipPath="url(#stripe-clip-bot)">
              <g className="stripe">
                <rect
                  x="-20"
                  y="406"
                  width="720"
                  height="14"
                  fill="#FAC775"
                  opacity="0.9"
                />
                {Array.from({ length: 37 }, (_, i) => (
                  <polygon
                    key={i}
                    points={`${-20 + i * 20},406 ${i * 20},406 ${-20 + i * 20},420 ${(i - 1) * 20},420`}
                    fill="#2C2C2A"
                    opacity="0.55"
                  />
                ))}
              </g>
            </g>

            {/* Crane tower */}
            <rect
              x="196"
              y="70"
              width="16"
              height="200"
              rx="2"
              fill="#888"
              opacity="0.25"
            />

            {/* Crane arm */}
            <g className="crane-arm">
              <rect
                x="148"
                y="66"
                width="140"
                height="10"
                rx="3"
                fill="#FAC775"
                opacity="0.9"
              />
              <rect
                x="148"
                y="62"
                width="36"
                height="18"
                rx="3"
                fill="#BA7517"
                opacity="0.85"
              />
              <line
                x1="276"
                y1="76"
                x2="276"
                y2="115"
                stroke="#888"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <g className="hook">
                <line
                  x1="272"
                  y1="115"
                  x2="272"
                  y2="135"
                  stroke="#888"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
                <path
                  d="M266 135 Q260 145 266 150 Q272 155 276 148"
                  fill="none"
                  stroke="#BA7517"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <rect
                  x="258"
                  y="154"
                  width="32"
                  height="40"
                  rx="3"
                  fill="#E6F1FB"
                  stroke="#378ADD"
                  strokeWidth="1"
                />
                <line
                  x1="258"
                  y1="162"
                  x2="290"
                  y2="162"
                  stroke="#85B7EB"
                  strokeWidth="1"
                />
                <line
                  x1="258"
                  y1="169"
                  x2="290"
                  y2="169"
                  stroke="#85B7EB"
                  strokeWidth="1"
                />
                <line
                  x1="258"
                  y1="176"
                  x2="280"
                  y2="176"
                  stroke="#85B7EB"
                  strokeWidth="1"
                />
                <text
                  x="274"
                  y="152"
                  textAnchor="middle"
                  fill="#185FA5"
                  fontSize="9"
                  fontWeight="500"
                >
                  PDF
                </text>
              </g>
            </g>

            {/* Hard hat */}
            <g className="hard-hat">
              <ellipse
                cx="340"
                cy="200"
                rx="36"
                ry="10"
                fill="#FAC775"
                opacity="0.95"
              />
              <path
                d="M304 200 Q304 178 340 175 Q376 178 376 200 Z"
                fill="#FAC775"
                opacity="0.95"
              />
              <rect
                x="308"
                y="193"
                width="64"
                height="8"
                rx="2"
                fill="#BA7517"
                opacity="0.8"
              />
              <rect
                x="328"
                y="175"
                width="24"
                height="8"
                rx="2"
                fill="#EF9F27"
                opacity="0.7"
              />
            </g>

            {/* Label card */}
            <rect
              x="140"
              y="230"
              width="400"
              height="60"
              rx="10"
              fill="#f5f5f4"
              opacity="0.85"
            />
            <rect
              x="140"
              y="230"
              width="400"
              height="60"
              rx="10"
              fill="none"
              stroke="#d0cfc9"
              strokeWidth="0.5"
            />
            <text
              x="340"
              y="257"
              textAnchor="middle"
              fontSize="15"
              fontWeight="500"
              fill="#1a1a18"
            >
              Reports &amp; PDF
            </text>
            <text
              x="340"
              y="278"
              textAnchor="middle"
              fontSize="12"
              fill="#888780"
            >
              Under construction — coming soon for pharmacy
            </text>

            {/* Blinking dot */}
            <circle cx="178" cy="261" r="5" fill="#EF9F27" className="blink" />

            {/* Progress bar */}
            <rect
              x="194"
              y="300"
              width="292"
              height="8"
              rx="4"
              fill="#e8e6e0"
              stroke="#d0cfc9"
              strokeWidth="0.5"
            />
            <clipPath id="pb-clip">
              <rect x="194" y="300" width="292" height="8" rx="4" />
            </clipPath>
            <g clipPath="url(#pb-clip)">
              <rect
                x="194"
                y="300"
                height="8"
                rx="4"
                fill="#EF9F27"
                className="progress-fill"
              />
            </g>
            <text
              x="340"
              y="324"
              textAnchor="middle"
              fontSize="11"
              fill="#888780"
            >
              Building something great...
            </text>

            {/* Gear 1 */}
            <g className="gear1">
              <circle
                cx="420"
                cy="210"
                r="14"
                fill="#f0ede6"
                stroke="#888780"
                strokeWidth="2"
                opacity="0.7"
              />
              <circle cx="420" cy="210" r="4" fill="#888780" opacity="0.5" />
              <g
                stroke="#888780"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
              >
                <line x1="420" y1="192" x2="420" y2="186" />
                <line x1="420" y1="228" x2="420" y2="234" />
                <line x1="402" y1="210" x2="396" y2="210" />
                <line x1="438" y1="210" x2="444" y2="210" />
                <line x1="407.3" y1="197.3" x2="403.1" y2="193.1" />
                <line x1="432.7" y1="222.7" x2="436.9" y2="226.9" />
                <line x1="432.7" y1="197.3" x2="436.9" y2="193.1" />
                <line x1="407.3" y1="222.7" x2="403.1" y2="226.9" />
              </g>
            </g>

            {/* Gear 2 */}
            <g className="gear2">
              <circle
                cx="452"
                cy="232"
                r="12"
                fill="#f0ede6"
                stroke="#B4B2A9"
                strokeWidth="2"
                opacity="0.7"
              />
              <circle cx="452" cy="232" r="3" fill="#B4B2A9" opacity="0.5" />
              <g
                stroke="#B4B2A9"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              >
                <line x1="452" y1="218" x2="452" y2="214" />
                <line x1="452" y1="246" x2="452" y2="250" />
                <line x1="438" y1="232" x2="434" y2="232" />
                <line x1="466" y1="232" x2="470" y2="232" />
                <line x1="442.6" y1="222.6" x2="439.7" y2="219.7" />
                <line x1="461.4" y1="241.4" x2="464.3" y2="244.3" />
                <line x1="461.4" y1="222.6" x2="464.3" y2="219.7" />
                <line x1="442.6" y1="241.4" x2="439.7" y2="244.3" />
              </g>
            </g>

            {/* Wrench */}
            <g className="wrench">
              <rect
                x="560"
                y="240"
                width="10"
                height="40"
                rx="3"
                fill="#B4B2A9"
                opacity="0.7"
              />
              <rect
                x="554"
                y="238"
                width="22"
                height="10"
                rx="3"
                fill="#888780"
                opacity="0.8"
              />
              <rect
                x="558"
                y="276"
                width="14"
                height="10"
                rx="3"
                fill="#888780"
                opacity="0.8"
              />
            </g>

            {/* Bricks */}
            <g opacity="0.55">
              <rect
                x="82"
                y="310"
                width="28"
                height="14"
                rx="2"
                fill="#FAC775"
              />
              <rect
                x="112"
                y="310"
                width="28"
                height="14"
                rx="2"
                fill="#FAC775"
              />
              <rect
                x="96"
                y="296"
                width="28"
                height="14"
                rx="2"
                fill="#EF9F27"
              />
              <rect
                x="82"
                y="324"
                width="58"
                height="14"
                rx="2"
                fill="#EF9F27"
              />
            </g>
            <line
              x1="86"
              y1="295"
              x2="102"
              y2="309"
              stroke="#888780"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <polygon
              points="82,291 90,291 102,309 94,309"
              fill="#B4B2A9"
              opacity="0.6"
            />

            {/* Eyebrow */}
            <text
              x="340"
              y="48"
              textAnchor="middle"
              fontSize="11"
              fill="#BA7517"
              fontWeight="500"
              letterSpacing="1.5"
            >
              AUDIT-READY REPORTING
            </text>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="page-title">
        <p className="eyebrow">Audit-ready reporting</p>
        <h1>Reports &amp; PDF Preview</h1>
        <span>
          Formal hospital branding, printable layouts, watermark support and
          signature sections.
        </span>
      </div>

      {/* ── Filters (shared across all tabs) ── */}
      <ReportFilters
        reportMode={reportMode}
        setReportMode={setReportMode}
        monthlyYear={monthlyYear}
        setMonthlyYear={setMonthlyYear}
        monthlyMonth={monthlyMonth}
        setMonthlyMonth={setMonthlyMonth}
        calendarYear={calendarYear}
        setCalendarYear={setCalendarYear}
        financialYear={financialYear}
        setFinancialYear={setFinancialYear}
        startYear={startYear}
        setStartYear={setStartYear}
        startMonth={startMonth}
        setStartMonth={setStartMonth}
        endYear={endYear}
        setEndYear={setEndYear}
        endMonth={endMonth}
        setEndMonth={setEndMonth}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={setAppliedSearchTerm}
        now={now}
      />

      {/* ── Tab navigation ── */}
      <div
        className="report-tabs no-print"
        role="tablist"
        aria-label="Report sections"
      >
        {REPORT_TABS.map((tab) => (
          <button
            type="button"
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`report-tab-btn${activeTab === tab.id ? " report-tab-btn--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {monthly.isError && <ErrorPanel error={monthly.error} />}
      {monthly.isLoading && <Skeleton rows={4} />}

      {/* ── Report preview wrapper ── */}
      <div className="report-preview">
        <div className="report-watermark">{HOSPITAL_NAME}</div>

        {/* Shared printable header — always visible */}
        <div className="report-header">
          <div>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {HOSPITAL_NAME}
            </p>
            <h2>{activeTabLabel}</h2>
            <p style={{ marginTop: 4 }}>Period: {periodLabel}</p>
          </div>
          <div className="report-meta">
            <div>Page 1</div>
            <ReportGeneratedTime />
          </div>
        </div>

        {/* ── Per-tab action bar ── */}
        <div
          className="report-tab-actions no-print"
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <button
            className="btn btn-primary"
            type="button"
            onClick={handlePrint}
          >
            Export PDF / Print
          </button>
          {exportHandlers[activeTab] && (
            <button
              className="btn btn-success"
              type="button"
              onClick={exportHandlers[activeTab]!}
            >
              Export as Excel
            </button>
          )}
        </div>

        {/* ── Tab panels ── */}

        {/* 1. Claims Summary */}
        <div
          id="tabpanel-claims-summary"
          role="tabpanel"
          aria-labelledby="tab-claims-summary"
          data-report-tab="claims-summary"
          hidden={activeTab !== "claims-summary"}
        >
          <ClaimsSummary
            totalClaims={totalClaims}
            totalAmount={totalAmount}
            periodShortLabel={periodShortLabel}
            periodLabel={periodLabel}
            summary={summary}
            isLoading={monthly.isLoading}
            formatCurrency={formatCurrency}
            labelize={labelize}
          />

          {patient.isLoading && appliedSearchTerm && <Skeleton rows={3} />}
          {patient.isError && <ErrorPanel error={patient.error} />}
          {patient.data && patient.data.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--accent-primary)",
                  marginBottom: 12,
                }}
              >
                Patient Claim Summary - {appliedSearchTerm}
              </h3>
              <div className="report-summary">
                {patient.data.map((row: any) => (
                  <div
                    className="report-summary-cell"
                    key={row._id ?? row.status}
                  >
                    <span>{labelize(row._id ?? row.status)}</span>
                    <strong>{row.count ?? 0}</strong>
                    <div
                      style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}
                    >
                      {formatCurrency(row.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Detailed Claims */}
        <div
          id="tabpanel-detailed-claims"
          role="tabpanel"
          aria-labelledby="tab-detailed-claims"
          data-report-tab="detailed-claims"
          hidden={activeTab !== "detailed-claims"}
        >
          <DetailedClaimsTable
            detailedClaims={detailedClaims}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            patientMap={patientMap}
            doctorMap={doctorMap}
            departmentMap={departmentMap}
            formatCurrency={formatCurrency}
            labelize={labelize}
          />
        </div>

        {/* 3. Department-wise Report */}
        <div
          id="tabpanel-department-report"
          role="tabpanel"
          aria-labelledby="tab-department-report"
          data-report-tab="department-report"
          hidden={activeTab !== "department-report"}
        >
          <DepartmentReportTable
            groups={departmentReportData.groups}
            grandTotals={departmentReportData.grandTotals}
            isLoading={settlementReport.isLoading}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* 4. Insurance Company Performance */}
        <div
          id="tabpanel-insurance-performance"
          role="tabpanel"
          aria-labelledby="tab-insurance-performance"
          data-report-tab="insurance-performance"
          hidden={activeTab !== "insurance-performance"}
        >
          <InsurancePerformanceTable
            insuranceData={filteredInsuranceData}
            isLoading={insurance.isLoading}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* 5. Settlement Financial Review */}
        <div
          id="tabpanel-settlement-review"
          role="tabpanel"
          aria-labelledby="tab-settlement-review"
          data-report-tab="settlement-review"
          hidden={activeTab !== "settlement-review"}
        >
          <SettlementReviewTable
            settlementData={{
              settlements: filteredSettlements,
              totals: filteredSettlementTotals,
              count: filteredSettlements.length,
            }}
            isLoading={settlementReport.isLoading}
            formatCurrency={formatCurrency}
            labelize={labelize}
          />
        </div>

        {/* 6. Hospital Share & Vendor Payout */}
        <div
          id="tabpanel-hospital-share"
          role="tabpanel"
          aria-labelledby="tab-hospital-share"
          data-report-tab="hospital-share"
          hidden={activeTab !== "hospital-share"}
        >
          <HospitalShareTable
            data={{
              rows: filteredHospitalShareRows,
              totals: filteredHospitalShareTotals,
              count: filteredHospitalShareRows.length,
            }}
            isLoading={hospitalShare.isLoading}
            formatCurrency={formatCurrency}
            role={user?.role}
          />
        </div>

        {/* Shared printable footer — always visible */}
        <div className="report-footer">
          <span>
            Prepared for administration, insurers, auditors and financial
            review.
          </span>
          <span>Authorized signature: __________________</span>
        </div>
      </div>
    </div>
  );
}

//Helpers

const emptySettlementTotals = {
  totalClaimAmount: 0,
  totalApproved: 0,
  totalDeductions: 0,
  totalTds: 0,
  totalHospitalDiscount: 0,
  totalNetPayable: 0,
};
