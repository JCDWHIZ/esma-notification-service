import { Kafka, Producer } from "kafkajs";
import * as dotenv from "dotenv";

dotenv.config();

interface EmailData {
  email: string;
  title: string;
  schoolName: string;
  buttonLink?: string;
  buttonText?: string;
  emailButton: boolean;
  description: string;
}

interface TestMessage {
  messageType: string;
  data: EmailData;
}

async function main(): Promise<void> {
  // Get configuration from environment variables or use defaults
  const brokers = process.env.KAFKA_BROKERS || "localhost:9092";
  const topic = "email-actions";

  console.log(`Connecting to Kafka brokers: ${brokers}`);
  console.log(`Producing to topic: ${topic}`);

  // Create client
  const kafka = new Kafka({
    clientId: "email-test-producer",
    brokers: brokers.split(","),
    // Optional: Add authentication if needed
    // ssl: true,
    // sasl: {
    //   mechanism: 'plain',
    //   username: process.env.KAFKA_USERNAME || '',
    //   password: process.env.KAFKA_PASSWORD || '',
    // },
  });

  const producer: Producer = kafka.producer({
    // Equivalent to Pulsar's batchingEnabled: false
    allowAutoTopicCreation: true,
    // Ensure message delivery
    idempotent: true,
    // Retry configuration
    retry: {
      retries: 3,
      initialRetryTime: 100,
      maxRetryTime: 30000,
    },
  });

  try {
    // Connect producer
    await producer.connect();
    console.log("Producer created successfully");

    // Create a complete test message
    const message: TestMessage = {
      messageType: "SendEmail",
      data: {
        email: "ztxsk@ptct.net",
        title: "Test Email from Kafka Producer",
        schoolName: "Test School",
        buttonLink: "https://example.com/action",
        buttonText: "Click Here",
        emailButton: true,
        description:
          "This is a complete test message sent as a single unit via Kafka.",
      },
    };

    // Convert to JSON
    const messageJson: string = JSON.stringify(message);
    console.log("Sending message:", messageJson);

    // Send the message
    const result = await producer.send({
      topic,
      messages: [
        {
          // Use email as key for consistent partitioning
          key: message.data.email,
          value: messageJson,
          // Set headers (equivalent to Pulsar properties)
          headers: {
            source: "test-producer",
            timestamp: Date.now().toString(),
            messageType: message.messageType,
          },
        },
      ],
    });

    console.log("Message sent successfully:");
    console.log(`  Topic: ${result[0].topicName}`);
    console.log(`  Partition: ${result[0].partition}`);
    console.log(`  Offset: ${result[0].baseOffset}`);
    if (result[0].logAppendTime) {
      console.log(`  Timestamp: ${result[0].logAppendTime}`);
    }

    // Close resources
    await producer.disconnect();
    console.log("Producer closed successfully");
  } catch (error) {
    console.error("Error in producer:", error);
    try {
      await producer.disconnect();
    } catch (disconnectError) {
      console.error("Error during cleanup:", disconnectError);
    }
  }
}

main().catch((err: Error) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
