import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import * as dotenv from "dotenv";
import boss from "../../config/pgBoss";

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

interface KafkaMessage {
  messageType: string;
  data: EmailAction | any;
}

class EmailConsumerService {
  private kafka: Kafka;
  private consumer: Consumer;
  private readonly topic = "email-actions";
  private readonly groupId = "email-processor";

  constructor() {
    // Validate required environment variables
    const brokers = process.env.KAFKA_BROKERS;
    if (!brokers) {
      throw new Error("KAFKA_BROKERS environment variable is not defined");
    }

    console.log(`Connecting to Kafka brokers: ${brokers}`);

    this.kafka = new Kafka({
      clientId: "email-consumer-service",
      brokers: brokers.split(","),
      // Optional: Add authentication if needed
      // ssl: true,
      // sasl: {
      //   mechanism: 'plain',
      //   username: process.env.KAFKA_USERNAME || '',
      //   password: process.env.KAFKA_PASSWORD || '',
      // },
    });

    this.consumer = this.kafka.consumer({
      groupId: this.groupId,
      // Equivalent to Pulsar's receiverQueueSize
      maxBytesPerPartition: 1024 * 1024, // 1MB
      // Auto-commit messages after processing
      // Retry configuration
      retry: {
        retries: 3,
        initialRetryTime: 100,
        maxRetryTime: 30000,
      },
    });
  }

  async start(): Promise<void> {
    try {
      await this.consumer.connect();
      console.log("Connected to Kafka successfully");

      await this.consumer.subscribe({
        topic: this.topic,
        fromBeginning: false, // Set to true if you want to process all messages from the beginning
      });

      console.log(`Subscribed to topic: ${this.topic}`);
      console.log("Node.js Kafka consumer started and waiting for messages...");

      await this.consumer.run({
        eachMessage: async ({
          topic,
          partition,
          message,
        }: EachMessagePayload) => {
          await this.processMessage(message.value);
        },
      });
    } catch (error) {
      console.error("Error starting Kafka consumer:", error);
      throw error;
    }
  }

  private async processMessage(messageValue: Buffer | null): Promise<void> {
    if (!messageValue) {
      console.warn("Received empty message, skipping");
      return;
    }

    const rawData = messageValue.toString();
    console.log("DEBUG - Received raw message:", rawData);

    try {
      // Try to parse as JSON
      let messagePayload: KafkaMessage;
      try {
        messagePayload = JSON.parse(rawData);

        // Check if the result is a string (double-encoded JSON)
        if (typeof messagePayload === "string") {
          messagePayload = JSON.parse(messagePayload);
        }

        console.log("Parsed message:", JSON.stringify(messagePayload, null, 2));

        // Check if this is a complete message with required fields
        if (!messagePayload.messageType) {
          console.warn(
            "Received incomplete message (no messageType), skipping"
          );
          return;
        }

        // Process based on message type
        if (messagePayload.messageType === "SendEmail" && messagePayload.data) {
          // Cast to expected type for better type safety
          const emailData = messagePayload.data as EmailAction;
          await this.processEmailAction(emailData);
        } else {
          console.log(
            `Received message with type: ${messagePayload.messageType}`
          );
        }
      } catch (parseError) {
        console.warn(
          "Failed to parse as JSON, likely a message fragment. Skipping."
        );
        console.error("Parse error:", parseError);
        // In Kafka, we don't need to acknowledge fragments - they're handled automatically
      }
    } catch (error) {
      console.error("Error processing message:", error);
      // Kafka will automatically retry based on the retry configuration
      // If you want to send to a dead letter queue, you can implement that here
      throw error; // Re-throw to trigger retry mechanism
    }
  }

  private async processEmailAction(emailData: EmailAction): Promise<void> {
    // Validate required fields
    if (
      !emailData.email ||
      !emailData.title ||
      !emailData.schoolName ||
      !emailData.description
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
      console.log({ message: "Failed to enqueue email job." });
      throw error; // Re-throw to trigger Kafka retry
    }

    console.log("Email processed successfully");
  }

  async stop(): Promise<void> {
    console.log("Shutting down Kafka consumer gracefully...");
    try {
      await this.consumer.disconnect();
      console.log("Kafka consumer disconnected successfully");
    } catch (error) {
      console.error("Error during Kafka consumer shutdown:", error);
      throw error;
    }
  }
}

// Setup graceful shutdown
function setupGracefulShutdown(emailService: EmailConsumerService): void {
  const shutdown = async () => {
    console.log("Shutting down gracefully...");
    try {
      await emailService.stop();
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
async function main() {
  const emailService = new EmailConsumerService();

  // Setup graceful shutdown
  setupGracefulShutdown(emailService);

  try {
    await emailService.start();
  } catch (error) {
    console.error("Fatal error running Kafka consumer:", error);
    process.exit(1);
  }
}

// Start the application
main().catch((err) => {
  console.error("Fatal error running Kafka client:", err);
  process.exit(1);
});
