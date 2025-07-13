import { Application } from "express";
require("dotenv").config();
const express = require("express");
import cors from "cors";
const app: Application = express();
import "./jobs/pulsar/pulsar";
import "./jobs/kafka/kafka";
import { startEmailWorker } from "./jobs/emails/emailsJobs";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/test", (req, res) => {
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
