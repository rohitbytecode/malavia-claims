import express from "express";
import cors from "cors";

import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Claim Management API Running",
  });
});

app.use(errorMiddleware);

export default app;
