import { describe, it, expect, beforeAll } from "vitest";
import mongoose from "mongoose";
import { ClaimModel } from "@/modules/claims/schema/claim.schema.js";
import { ClaimStatus } from "@/modules/claims/constant/claim-status.enum.js";
import { ClaimType } from "@/modules/claims/constant/claim-type.enum.js";
import { PayerContractModel } from "@/modules/payer-contracts/schema/payer-contract.schema.js";
import { SettlementService } from "@/modules/settlements/service/settlement.service.js";
import { SettlementModel } from "@/modules/settlements/schema/settlement.schema.js";

describe("Settlement Hybrid Discounts Calculations", () => {
  let claimId: string;
  let payerContractId: string;
  let userId: string;

  beforeAll(async () => {
    userId = new mongoose.Types.ObjectId().toString();

    // Create a mock contract with default hospital discount = 10%
    // and Pharmacy-specific policy of 25% discount.
    const contract = await PayerContractModel.create({
      insuranceCompanyId: new mongoose.Types.ObjectId(),
      effectiveFrom: new Date(),
      defaultHospitalDiscountPercent: 10,
      tdsPercent: 10,
      departmentPolicies: [
        {
          departmentCategory: "PHARMACY",
          discountPercent: 25,
          isApplicable: true,
        },
        {
          departmentCategory: "ROOM_CHARGES",
          discountPercent: 10,
          isApplicable: true,
        },
      ],
      createdBy: new mongoose.Types.ObjectId(),
    });
    payerContractId = contract._id.toString();

    const claim = await ClaimModel.create({
      claimNumber: "CLM-SETTLE-001",
      type: ClaimType.CASHLESS,
      status: ClaimStatus.SETTLEMENT_PENDING,
      patientId: new mongoose.Types.ObjectId(),
      hospitalId: new mongoose.Types.ObjectId(),
      totalClaimAmount: 15000,
    });
    claimId = claim._id.toString();
  });

  it("should calculate correct hybrid discounts, vendor payout, and hospital share", async () => {
    // Breakdown: Pharmacy: 10,000, Room Charges: 5,000
    const departmentBreakdown = [
      {
        departmentCategory: "PHARMACY" as any,
        claimedAmount: 10000,
        approvedAmount: 10000,
        deduction: 0,
        discountPercent: 10, // backward compatibility
        discountAmount: 1000,
        netAmount: 9000,
        companyDiscountPercent: 10,
        companyDiscountAmount: 1000,
        vendorDiscountPercent: 25,
        vendorDiscountAmount: 2500,
        vendorPayout: 7500,
        hospitalShare: 1500,
        remarks: "Pharmacy Vendor 25% vs Payer 10%",
      },
      {
        departmentCategory: "ROOM_CHARGES" as any,
        claimedAmount: 5000,
        approvedAmount: 5000,
        deduction: 0,
        discountPercent: 10,
        discountAmount: 500,
        netAmount: 4500,
        companyDiscountPercent: 10,
        companyDiscountAmount: 500,
        vendorDiscountPercent: 10,
        vendorDiscountAmount: 500,
        vendorPayout: 0, // Not a vendor department
        hospitalShare: 4500,
        remarks: "Internal Department - Hospital gets 4500",
      },
    ];

    const settlement = await SettlementService.createSettlement({
      claimId,
      approvedAmount: 15000,
      hospitalDiscount: 1500, // Total company discount
      deductions: 0,
      tds: 1350, // 10% of 13,500 (15,000 approved - 1,500 company discount)
      settlementMethod: "PORTAL" as any,
      remarks: "Test Settlement",
      settledBy: userId,
      refundAmount: 0,
      payerContractId,
      departmentBreakdown,
      totalCompanyDiscount: 1500,
      totalVendorPayout: 7500,
      hospitalNetShare: 4650, // Net company payable (15000 - 1500 - 1350 = 12150) - Vendor Payout (7500) = 4650
    });

    expect(settlement).toBeDefined();
    expect(settlement.approvedAmount).toBe(15000);
    expect(settlement.hospitalDiscount).toBe(1500);
    expect(settlement.netPayable).toBe(12150); // 15000 - 1500 (discount) - 1350 (tds)
    expect(settlement.totalCompanyDiscount).toBe(1500);
    expect(settlement.totalVendorPayout).toBe(7500);
    expect(settlement.hospitalNetShare).toBe(4650);

    const bd = settlement.departmentBreakdown;
    expect(bd).toHaveLength(2);

    const pharmacy = bd.find((b) => b.departmentCategory === "PHARMACY");
    expect(pharmacy).toBeDefined();
    expect(pharmacy?.companyDiscountPercent).toBe(10);
    expect(pharmacy?.companyDiscountAmount).toBe(1000);
    expect(pharmacy?.vendorDiscountPercent).toBe(25);
    expect(pharmacy?.vendorDiscountAmount).toBe(2500);
    expect(pharmacy?.vendorPayout).toBe(7500);
    expect(pharmacy?.hospitalShare).toBe(1500);

    const room = bd.find((b) => b.departmentCategory === "ROOM_CHARGES");
    expect(room).toBeDefined();
    expect(room?.companyDiscountPercent).toBe(10);
    expect(room?.companyDiscountAmount).toBe(500);
    expect(room?.vendorDiscountPercent).toBe(10);
    expect(room?.vendorDiscountAmount).toBe(500);
    expect(room?.vendorPayout).toBe(0);
    expect(room?.hospitalShare).toBe(4500);
  });
});
