import { Request, Response } from "express";
import { DoctorService } from "@/modules/doctors/service/doctor.service.js";

export class DoctorController {
  static async createDoctor(req: Request, res: Response) {
    const doctor = await DoctorService.createDoctor(req.body);
    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      data: doctor,
    });
  }

  static async listDoctors(req: Request, res: Response) {
    const { isActive, page, limit } = req.query as {
      isActive?: string;
      page?: string;
      limit?: string;
    };
    const doctors = await DoctorService.listDoctors(
      isActive === undefined ? undefined : isActive === "true",
      Number(page ?? 1),
      Number(limit ?? 100)
    );
    return res.status(200).json({
      success: true,
      message: "Doctors listed successfully",
      data: doctors,
    });
  }

  static async getDoctor(req: Request, res: Response) {
    const { doctorId } = req.params as { doctorId: string };
    const doctor = await DoctorService.getDoctorById(doctorId);
    return res.status(200).json({
      success: true,
      message: "Doctor fetched successfully",
      data: doctor,
    });
  }

  static async updateDoctor(req: Request, res: Response) {
    const { doctorId } = req.params as { doctorId: string };
    const doctor = await DoctorService.updateDoctor(doctorId, req.body);
    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
    });
  }

  static async deleteDoctor(req: Request, res: Response) {
    const { doctorId } = req.params as { doctorId: string };
    const doctor = await DoctorService.deleteDoctor(doctorId);
    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
      data: doctor,
    });
  }
}
