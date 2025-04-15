import * as Pulsar from "pulsar-client";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Get configuration from environment variables or use defaults
  const serviceUrl = process.env.PULSAR || "pulsar://localhost:6650";
  const topic = "persistent://public/default/email-actions";

  console.log(`Connecting to Pulsar at ${serviceUrl}...`);
  console.log(`Producing to topic: ${topic}`);

  // Create client
  const client = new Pulsar.Client({
    serviceUrl,
    operationTimeoutSeconds: 30,
  });

  try {
    // Create producer
    const producer = await client.createProducer({
      topic,
      sendTimeoutMs: 30000,
      // Important to ensure the message is sent as a complete unit
      batchingEnabled: false,
    });

    console.log("Producer created successfully");

    // Create a complete test message
    const message = {
      messageType: "SendEmail",
      data: {
        email: "ztxsk@ptct.net",
        title: "Test Email from Producer",
        schoolName: "Test School",
        buttonLink: "https://example.com/action",
        buttonText: "Click Here",
        emailButton: true,
        description: "This is a complete test message sent as a single unit.",
      },
    };

    // Convert to JSON
    const messageJson = JSON.stringify(message);
    console.log("Sending message:", messageJson);

    // Send the message
    const msgId = await producer.send({
      data: Buffer.from(messageJson),
      // Set properties if needed
      properties: {
        source: "test-producer",
        timestamp: Date.now().toString(),
      },
    });

    console.log(`Message sent successfully with ID: ${msgId}`);

    // Close resources
    await producer.close();
    await client.close();
    console.log("Producer closed successfully");
  } catch (error) {
    console.error("Error in producer:", error);
    await client.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
