import { Request, Response } from "express";
import boss from "../config/pgBoss";
/**
 * @swagger
 * /api/send-custom-email:
 *   post:
 *     summary: Send a custom email
 *     description: Sends a custom email with or without a button based on the provided parameters.
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - title
 *               - schoolName
 *               - description
 *               - EmailWithButton
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Recipient's email address.
 *               title:
 *                 type: string
 *                 description: Subject/title of the email.
 *               schoolName:
 *                 type: string
 *                 description: Name of the school receiving the email.
 *               description:
 *                 type: string
 *                 description: Content of the email message.
 *               EmailButton:
 *                 type: boolean
 *                 description: Determines whether to include a button in the email.
 *               buttonLink:
 *                 type: string
 *                 format: uri
 *                 description: URL for the button (required if EmailWithButton is true).
 *               buttonText:
 *                 type: string
 *                 description: Text to be displayed on the button (required if EmailWithButton is true).
 *     responses:
 *       200:
 *         description: Email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sent successfully."
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameters."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
// export const sendCustomEmail = async (req: Request, res: Response) => {
//   const {
//     email,
//     title,
//     schoolName,
//     buttonLink,
//     buttonText,
//     EmailButton,
//     description,
//   } = req.body;

//   if (!title || !email || !schoolName || !description) {
//     return res.status(400).json({ message: "Please fill in all fields" });
//   }

//   try {
//     await boss.send("sendCustomEmail", {
//       email,
//       title,
//       schoolName,
//       description,
//       buttonLink,
//       buttonText,
//       EmailButton,
//     });

//     return res
//       .status(200)
//       .json({ message: "Email job enqueued successfully." });
//   } catch (error) {
//     console.error("Error enqueuing email job:", error);
//     return res.status(500).json({ message: "Failed to enqueue email job." });
//   }
// };

export const sendCustomEmail = async (req: Request, res: Response) => {
  const {
    email,
    title,
    schoolName,
    buttonLink,
    buttonText,
    EmailButton,
    description,
  } = req.body;

  if (!title || !email || !schoolName || !description) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  const queueName = "email-queue";

  try {
    // First, ensure the queue exists
    await boss.createQueue(queueName);

    // Then send the job to the queue
    const jobId = await boss.send(queueName, {
      email,
      title,
      schoolName,
      description,
      buttonLink,
      buttonText,
      EmailButton,
    });

    console.log(`Created job ${jobId} in queue ${queueName}`);

    return res
      .status(200)
      .json({ message: "Email job enqueued successfully.", jobId });
  } catch (error) {
    console.error("Error enqueuing email job:", error);
    return res.status(500).json({ message: "Failed to enqueue email job." });
  }
};
