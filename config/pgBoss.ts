// src/config/pgBoss.ts
import PgBoss from "pg-boss";

const connectionString = process.env.DATABASE_URL;

const boss = new PgBoss({
  connectionString,
  schema: "public",
  application_name: "email-worker",
});

boss
  .start()
  .then(() => {
    console.log("pg-boss started and connected to PostgreSQL.");
  })
  .catch((error) => {
    console.error("pg-boss failed to start:", error);
  });

boss.on("error", (error) => console.error("PgBoss error:", error));

export default boss;
