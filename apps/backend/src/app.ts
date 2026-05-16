import express from "express";
import cors from "cors";

import { errorMiddleware } from "./middleware/error.middleware.js";
import authRouter from "./modules/auth/index.js";
import usersRouter from "./modules/users/index.js";
import insuranceCompanyRouter from "./modules/insurance-companies/index.js";
import departmentRouter from "./modules/departments/index.js";
import communicationsRouter from "./modules/communications/index.js";
import documentsRouter from "./modules/documents/index.js";
import claimsRouter from "./modules/claims/index.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Claim Management API Running",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/insurance-companies", insuranceCompanyRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/communications", communicationsRouter);
app.use("/api/v1/documents", documentsRouter);
app.use("/api/v1/claims", claimsRouter);
app.use(errorMiddleware);

export default app;
