import { Application, Request, Response } from "express";
require("dotenv").config();
const express = require("express");
import cors from "cors";
const app: Application = express();
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
const Routes = require("./routes/index");
import path from "path";
import "./jobs/pulsar";
import { startEmailWorker } from "./jobs/emailsJobs";

const swaggerDefinition = {
  openapi: "3.1.0",
  info: {
    title: "Esma Shared",
    description: "API documentation",
    version: "1.0.0",
  },
  servers: [
    {
      url: "/shared",
      description: "Default Server (relative URL)",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.ts", "./index.ts"], // <- Adjust to your route files
};

const swaggerSpec = swaggerJsdoc(options);

// connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use("/shared/api", Routes);

/**
 * @openapi
 * /images/{filename}:
 *   get:
 *     summary: Download an image by filename
 *     tags:
 *       - File Handling
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the image file to retrieve
 *     responses:
 *       200:
 *         description: Image file
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 */
app.get("/shared/images/:filename", (req: Request, res: Response) => {
  const imagePath = path.resolve(__dirname, "uploads", req.params.filename);

  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send("Image not found");
    }
  });
});

// Example Route
/**
 * @openapi
 * /api/test:
 *   get:
 *     description: Test endpoint
 *     responses:
 *       200:
 *         description: Success
 */
app.get("/shared/api/test", (req, res) => {
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
app.use("/shared/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
startEmailWorker().then(() => console.log("Email worker started"));
// .catch(err => console.error("Failed to start email worker:", err));

app.listen(process.env.PORT, () => {
  console.log("Server running on port: ", process.env.PORT);
});
