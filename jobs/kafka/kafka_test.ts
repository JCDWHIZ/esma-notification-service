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

class KafkaTestService {
  private kafka: Kafka;
  private producer: Producer;
  private readonly topic = "email-actions";

  constructor() {
    const brokers = process.env.KAFKA_BROKERS || "localhost:9092";

    console.log(`Initializing Kafka Test Service...`);
    console.log(`Brokers: ${brokers}`);
    console.log(`Topic: ${this.topic}`);

    this.kafka = new Kafka({
      clientId: "email-test-service",
      brokers: brokers.split(","),
      // Optional: Add authentication if needed
      // ssl: true,
      // sasl: {
      //   mechanism: 'plain',
      //   username: process.env.KAFKA_USERNAME || '',
      //   password: process.env.KAFKA_PASSWORD || '',
      // },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      idempotent: true,
      retry: {
        retries: 3,
        initialRetryTime: 100,
        maxRetryTime: 30000,
      },
    });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      console.log("✅ Kafka producer connected successfully");
    } catch (error) {
      console.error("❌ Error connecting to Kafka:", error);
      throw error;
    }
  }

  async sendTestEmail(testCase: string = "default"): Promise<void> {
    const testMessages: Record<string, TestMessage> = {
      default: {
        messageType: "SendEmail",
        data: {
          email: "ztxsk@ptct.net",
          title: "Test Email from Kafka Service",
          schoolName: "Test School",
          buttonLink: "https://example.com/action",
          buttonText: "Click Here",
          emailButton: true,
          description: "This is a complete test message sent via Kafka.",
        },
      },
      welcome: {
        messageType: "SendEmail",
        data: {
          email: "welcome@test.com",
          title: "Welcome to Our Platform",
          schoolName: "Demo Academy",
          buttonLink: "https://demo.com/welcome",
          buttonText: "Get Started",
          emailButton: true,
          description:
            "Welcome to our educational platform. Click the button below to get started with your learning journey.",
        },
      },
      notification: {
        messageType: "SendEmail",
        data: {
          email: "notify@test.com",
          title: "Important Notification",
          schoolName: "Alert System",
          buttonLink: "https://alerts.com/view",
          buttonText: "View Details",
          emailButton: true,
          description:
            "You have received an important notification. Please review the details by clicking the button below.",
        },
      },
      minimal: {
        messageType: "SendEmail",
        data: {
          email: "minimal@test.com",
          title: "Simple Test",
          schoolName: "Basic School",
          emailButton: false,
          description:
            "This is a minimal test message without buttons or links.",
        },
      },
    };

    const message = testMessages[testCase] || testMessages.default;

    try {
      const messageJson: string = JSON.stringify(message);
      console.log(`\n🚀 Sending ${testCase} test message...`);
      console.log("Message content:", JSON.stringify(message, null, 2));

      const result = await this.producer.send({
        topic: this.topic,
        messages: [
          {
            key: message.data.email,
            value: messageJson,
            headers: {
              source: "test-service",
              testCase,
              timestamp: Date.now().toString(),
              messageType: message.messageType,
            },
          },
        ],
      });

      console.log("✅ Message sent successfully:");
      console.log(`   Topic: ${result[0].topicName}`);
      console.log(`   Partition: ${result[0].partition}`);
      console.log(`   Offset: ${result[0].baseOffset}`);
      if (result[0].logAppendTime) {
        console.log(`   Timestamp: ${result[0].logAppendTime}`);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      throw error;
    }
  }

  async sendBatchMessages(): Promise<void> {
    console.log("\n📦 Sending batch of test messages...");

    try {
      await this.sendTestEmail("default");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay

      await this.sendTestEmail("welcome");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay

      await this.sendTestEmail("notification");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay

      await this.sendTestEmail("minimal");

      console.log("✅ All batch messages sent successfully");
    } catch (error) {
      console.error("❌ Error sending batch messages:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      console.log("✅ Kafka producer disconnected successfully");
    } catch (error) {
      console.error("❌ Error disconnecting from Kafka:", error);
      throw error;
    }
  }
}

async function main(): Promise<void> {
  const testService = new KafkaTestService();

  try {
    await testService.connect();

    // Get test case from command line argument or use default
    const testCase = process.argv[2] || "default";

    if (testCase === "batch") {
      await testService.sendBatchMessages();
    } else {
      await testService.sendTestEmail(testCase);
    }

    console.log("\n🎉 Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await testService.disconnect();
  }
}

// Handle command line usage
if (process.argv.length > 2) {
  const validTestCases = [
    "default",
    "welcome",
    "notification",
    "minimal",
    "batch",
  ];
  const testCase = process.argv[2];

  if (!validTestCases.includes(testCase)) {
    console.log("Usage: node test-service.js [test-case]");
    console.log("Available test cases:", validTestCases.join(", "));
    process.exit(1);
  }
}

main().catch((err: Error) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
