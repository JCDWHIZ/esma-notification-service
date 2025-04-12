import { Application, Request, Response } from "express";
require("dotenv").config();
const express = require("express");
import cors from "cors";
const app: Application = express();
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swagger_output.json";
const EmailRoutes = require("./routes/index");
import path from "path";
import "./jobs/index";
import { startEmailWorker } from "./jobs/emailsJobs";

// connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use("/api/email", EmailRoutes);
app.get("/images/:filename", (req: Request, res: Response) => {
  const imagePath = path.resolve(__dirname, "uploads", req.params.filename);

  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send("Image not found");
    }
  });
});

// Example Route
app.get("/api/test", (req, res) => {
  /**
   * @swagger
   * /api/test:
   *   get:
   *     description: Test endpoint
   *     responses:
   *       200:
   *         description: Success
   */
  res.json({ message: "Hello World" });
});

// Test function
// async function testPgBoss() {
//   console.log("Testing pg-boss...");

//   // Register a simple worker
//   boss.work("test-job", async (jobs) => {
//     console.log("Test worker received jobs:", jobs.length);
//     return { success: true };
//   });

//   // Send a test job
//   await boss.send("test-job", { test: true });
//   console.log("Test job sent");
// }

// // Call this from your main file
// testPgBoss();
startEmailWorker().then(() => console.log("Email worker started"));
// .catch(err => console.error("Failed to start email worker:", err));

app.listen(process.env.PORT, () => {
  console.log("Server running on port: ", process.env.PORT);
});
