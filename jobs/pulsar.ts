// import * as Pulsar from "pulsar-client";
// require("dotenv").config();

// async function main() {
//   const client = new Pulsar.Client({
//     serviceUrl: process.env.PULSAR || "",
//   });

//   const consumer = await client.subscribe({
//     topic: "persistent://public/default/email-actions",
//     subscription: "my-subscription",
//     subscriptionType: "Shared",
//   });

//   console.log("Node.js Pulsar consumer started and waiting for messages...");

//   while (true) {
//     try {
//       const msg = await consumer.receive();
//       const raw = msg.getData().toString();
//       console.log("DEBUG - Raw message:", JSON.stringify(raw));

//       //   const onceParsed = JSON.parse(raw);
//       //   const messagePayload =
//       // typeof onceParsed === "string" ? JSON.parse(onceParsed) : onceParsed;
//       //   const data = msg.getData().toString();
//       //   const messagePayload = JSON.parse(data);

//       //   console.log("Received message:", messagePayload);

//       // Process the message: Trigger sending email or any further business logic
//       // For example, call your email service:
//       // await sendEmail(messagePayload.email, messagePayload.subject, messagePayload.body);

//       // Acknowledge the message so Pulsar knows it was processed successfully
//       consumer.acknowledge(msg);

//       // Directly parse once
//       const messagePayload = JSON.parse(raw);
//       console.log("Received message:", messagePayload);

//       // Process your logic here and then:
//       consumer.acknowledge(msg);
//     } catch (error) {
//       console.error("Error processing message:", error);
//     }
//   }

//   // In a real application, ensure you manage graceful shutdowns:
//   // await consumer.close();
//   // await client.close();
// }

// main().catch((err) => {
//   console.error("Error running pulsar client:", err);
// });

// import * as Pulsar from "pulsar-client";
// import * as dotenv from "dotenv";

// // Load environment variables
// dotenv.config();

// // Define interfaces for your message types
// interface EmailAction {
//   to: string;
//   subject: string;
//   body: string;
//   attachments?: string[];
// }

// interface PulsarMessage {
//   messageType: string;
//   data: EmailAction | any;
// }

// async function main() {
//   // Validate required environment variables
//   const serviceUrl = process.env.PULSAR;
//   if (!serviceUrl) {
//     throw new Error("PULSAR_SERVICE_URL environment variable is not defined");
//   }

//   console.log(`Connecting to Pulsar at ${serviceUrl}...`);

//   const client = new Pulsar.Client({
//     serviceUrl,
//     operationTimeoutSeconds: 30,
//   });

//   const topic = "persistent://public/default/email-actions";
//   const subscription = "email-processor";

//   console.log(`Subscribing to topic: ${topic}`);

//   const consumer = await client.subscribe({
//     topic,
//     subscription,
//     subscriptionType: "Shared",
//     // Enable negative acknowledgment for message recovery
//     nAckRedeliverTimeoutMs: 60000,
//   });

//   console.log("Node.js Pulsar consumer started and waiting for messages...");

//   // Setup graceful shutdown
//   setupGracefulShutdown(client, consumer);

//   // Message processing loop
//   while (true) {
//     try {
//       const msg = await consumer.receive();
//       const rawData = msg.getData().toString();

//       console.log("DEBUG - Received raw message:", rawData);

//       let messagePayload: PulsarMessage;

//       try {
//         // Parse the message - handling both direct JSON and possibly double-encoded JSON
//         messagePayload = JSON.parse(rawData);

//         // Check if the result is a string (double-encoded JSON)
//         if (typeof messagePayload === "string") {
//           messagePayload = JSON.parse(messagePayload);
//         }

//         console.log("Parsed message:", JSON.stringify(messagePayload, null, 2));

//         // Process based on message type
//         if (messagePayload.messageType === "SendEmail") {
//           // Cast to expected type for better type safety
//           const emailData = messagePayload.data as EmailAction;
//           await processEmailAction(emailData);
//         } else {
//           console.log(
//             `Received unknown message type: ${messagePayload.messageType}`
//           );
//         }

//         // Acknowledge successful processing
//         await consumer.acknowledge(msg);
//       } catch (parseError) {
//         console.error("Error parsing message:", parseError);
//         // Negative acknowledge so the message gets redelivered
//         await consumer.negativeAcknowledge(msg);
//       }
//     } catch (processingError) {
//       console.error("Error processing message:", processingError);
//       // Continue processing other messages
//     }
//   }
// }

// async function processEmailAction(emailData: EmailAction): Promise<void> {
//   console.log("Processing email action:");
//   console.log(`  To: ${emailData.to}`);
//   console.log(`  Subject: ${emailData.subject}`);
//   console.log(`  Body length: ${emailData.body.length} characters`);

//   // Implement your email sending logic here
//   // Example:
//   // await emailService.sendEmail(emailData.to, emailData.subject, emailData.body, emailData.attachments);

//   console.log("Email processed successfully");
// }

// function setupGracefulShutdown(
//   client: Pulsar.Client,
//   consumer: Pulsar.Consumer
// ): void {
//   const shutdown = async () => {
//     console.log("Shutting down gracefully...");
//     try {
//       await consumer.close();
//       console.log("Consumer closed");
//       await client.close();
//       console.log("Client closed");
//       process.exit(0);
//     } catch (err) {
//       console.error("Error during shutdown:", err);
//       process.exit(1);
//     }
//   };

//   // Handle termination signals
//   process.on("SIGINT", shutdown);
//   process.on("SIGTERM", shutdown);
//   process.on("uncaughtException", (err) => {
//     console.error("Uncaught exception:", err);
//     shutdown();
//   });
// }

// // Start the application
// main().catch((err) => {
//   console.error("Fatal error running Pulsar client:", err);
//   process.exit(1);
// });

import * as Pulsar from "pulsar-client";
import * as dotenv from "dotenv";
import boss from "../config/pgBoss";

// Load environment variables
dotenv.config();

// Define interfaces for your message types
interface EmailAction {
  email: string;
  title: string;
  schoolName: string;
  buttonLink?: string;
  buttonText?: string;
  emailButton: boolean;
  description?: string;
}
// interface EmailAction {
//   to: string;
//   subject: string;
//   body: string;
//   attachments?: string[];
// }

interface PulsarMessage {
  messageType: string;
  data: EmailAction | any;
}

async function main() {
  // Validate required environment variables
  const serviceUrl = process.env.PULSAR;
  if (!serviceUrl) {
    throw new Error("PULSAR environment variable is not defined");
  }

  console.log(`Connecting to Pulsar at ${serviceUrl}...`);

  const client = new Pulsar.Client({
    serviceUrl,
    operationTimeoutSeconds: 30,
  });

  const topic = "persistent://public/default/email-actions";
  const subscription = "email-processor";

  console.log(`Subscribing to topic: ${topic}`);

  const consumer = await client.subscribe({
    topic,
    subscription,
    subscriptionType: "Shared",
    // Enable negative acknowledgment for message recovery
    nAckRedeliverTimeoutMs: 60000,
    // Set a larger receive queue size to get more messages at once
    receiverQueueSize: 100,
  });

  console.log("Node.js Pulsar consumer started and waiting for messages...");

  // Setup graceful shutdown
  setupGracefulShutdown(client, consumer);

  // Message processing loop
  while (true) {
    try {
      const msg = await consumer.receive();
      const rawData = msg.getData().toString();

      console.log("DEBUG - Received raw message:", rawData);

      try {
        // Try to parse as JSON
        let messagePayload: PulsarMessage;
        try {
          messagePayload = JSON.parse(rawData);

          // Check if the result is a string (double-encoded JSON)
          if (typeof messagePayload === "string") {
            messagePayload = JSON.parse(messagePayload);
          }

          console.log(
            "Parsed message:",
            JSON.stringify(messagePayload, null, 2)
          );

          // Check if this is a complete message with required fields
          if (!messagePayload.messageType) {
            console.warn(
              "Received incomplete message (no messageType), acknowledging and continuing"
            );
            await consumer.acknowledge(msg);
            continue;
          }

          // Process based on message type
          if (
            messagePayload.messageType === "SendEmail" &&
            messagePayload.data
          ) {
            // Cast to expected type for better type safety
            const emailData = messagePayload.data as EmailAction;
            await processEmailAction(emailData);
          } else {
            console.log(
              `Received message with type: ${messagePayload.messageType}`
            );
          }

          // Acknowledge successful processing
          await consumer.acknowledge(msg);
        } catch (parseError) {
          // If parsing fails, this could be a fragmented message
          console.warn(
            "Failed to parse as JSON, likely a message fragment. Acknowledging fragment."
          );
          console.error("Parse error:", parseError);

          // For fragmented messages, just acknowledge them
          await consumer.acknowledge(msg);
        }
      } catch (error) {
        console.error("Error processing message:", error);
        await consumer.negativeAcknowledge(msg);
      }
    } catch (processingError) {
      console.error("Error in receive loop:", processingError);
      // Add a small delay before continuing to avoid tight loops in case of errors
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function processEmailAction(emailData: EmailAction): Promise<void> {
  // Validate required fields
  if (
    !emailData.email ||
    !emailData.title ||
    !emailData.description ||
    !emailData.emailButton
  ) {
    console.warn("Received incomplete email data, skipping processing");
    return;
  }

  console.log("Processing email action:");
  console.log(`  To: ${emailData.email}`);
  console.log(`  Subject: ${emailData.title}`);
  console.log(
    `  Body length: ${emailData.description?.length || 0} characters`
  );

  // Implement your email sending logic here
  // Example:
  // await emailService.sendEmail(emailData.to, emailData.subject, emailData.body, emailData.attachments);
  const queueName = "email-queue";

  try {
    // First, ensure the queue exists
    await boss.createQueue(queueName);

    // Then send the job to the queue
    const jobId = await boss.send(queueName, {
      email: emailData.email,
      title: emailData.title,
      schoolName: emailData.schoolName,
      description: emailData.description,
      buttonLink: emailData.buttonLink,
      buttonText: emailData.buttonText,
      emailButton: emailData.emailButton,
    });

    console.log(`Created job ${jobId} in queue ${queueName}`);
    console.log({ message: "Email job enqueued successfully.", jobId });
  } catch (error) {
    console.error("Error enqueuing email job:", error);
    return console.log({ message: "Failed to enqueue email job." });
  }
  console.log("Email processed successfully");
}
function setupGracefulShutdown(
  client: Pulsar.Client,
  consumer: Pulsar.Consumer
): void {
  const shutdown = async () => {
    console.log("Shutting down gracefully...");
    try {
      await consumer.close();
      console.log("Consumer closed");
      await client.close();
      console.log("Client closed");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  };

  // Handle termination signals
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    shutdown();
  });
}

// Start the application
main().catch((err) => {
  console.error("Fatal error running Pulsar client:", err);
  process.exit(1);
});
