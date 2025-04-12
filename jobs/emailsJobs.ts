// import boss from "../config/pgBoss";
// import {
//   sendEmail,
//   EmailWithButton,
//   EmailWithoutButton,
// } from "../config/emailservice";

// interface EmailJobData {
//   email: string;
//   title: string;
//   schoolName: string;
//   description: string;
//   buttonLink: string;
//   buttonText: string;
//   EmailButton: boolean;
// }

// boss.work<EmailJobData>("sendCustomEmail", async (jobs) => {
//   console.log("Worker reached and processing jobs");
//   for (const job of jobs) {
//     try {
//       console.log("Processing job:", job);
//       const {
//         email,
//         title,
//         schoolName,
//         description,
//         buttonLink,
//         buttonText,
//         EmailButton,
//       } = job.data;
//       const html = EmailButton
//         ? EmailWithoutButton(title, schoolName, description)
//         : EmailWithButton(
//             title,
//             schoolName,
//             buttonLink,
//             description,
//             buttonText
//           );
//       await sendEmail(email, title, html);
//       console.log(`Processed job for ${email}`);
//     } catch (error) {
//       console.error("Error processing job:", error);
//     }
//   }
// });
import boss from "../config/pgBoss";
import {
  sendEmail,
  EmailWithButton,
  EmailWithoutButton,
} from "../config/emailservice";
import PgBoss from "pg-boss";

interface EmailJobData {
  email: string;
  title: string;
  schoolName: string;
  description: string;
  buttonLink: string;
  buttonText: string;
  EmailButton: boolean;
}

// export const createEmailWorker = (boss: PgBoss) => {
//   console.log("Registering email worker...");

//   boss.work<EmailJobData>("sendCustomEmail", async (jobs) => {
//     console.log("Worker reached and processing jobs");
//     for (const job of jobs) {
//       try {
//         console.log("Processing job:", job);
//         const {
//           email,
//           title,
//           schoolName,
//           description,
//           buttonLink,
//           buttonText,
//           EmailButton,
//         } = job.data;
//         console.log("EmailButton:", job.data);
//         const html = EmailButton
//           ? EmailWithoutButton(title, schoolName, description)
//           : EmailWithButton(
//               title,
//               schoolName,
//               buttonLink,
//               description,
//               buttonText
//             );
//         await sendEmail(email, title, html);
//         console.log(`Processed job for ${email}`);
//       } catch (error) {
//         console.error("Error processing job:", error);
//       }
//     }
//   });

//   console.log("Email worker registered successfully");
// };

export const startEmailWorker = async () => {
  try {
    await boss.start();
    console.log("PgBoss started successfully");

    const queueName = "email-queue";
    await boss.createQueue(queueName);
    await boss.work(queueName, async ([job]) => {
      const {
        email,
        title,
        schoolName,
        description,
        buttonLink,
        buttonText,
        EmailButton,
      } = job.data as EmailJobData;
      const html = EmailButton
        ? EmailWithButton(
            title,
            schoolName,
            buttonLink,
            description,
            buttonText
          )
        : EmailWithoutButton(title, schoolName, description);

      await sendEmail(email, title, html);
    });

    console.log(`Worker registered for queue ${queueName}`);
  } catch (error) {
    console.error("Failed to start email worker:", error);
  }
};
