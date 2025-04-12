import { Response } from "express";
import path from "path";
import cloudinary from "../config/cloudinary";

export const singleUpload = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = path.resolve(__dirname, "../uploads", req.file.filename);
    console.log(`Resolved image path: ${imagePath}`);

    const result = await cloudinary.uploader.upload(imagePath);

    res.json({
      message: "File uploaded successfully",
      data: result,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error });
  }
};

// export const multipleUploads = async (req: any, res: Response) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: "No files uploaded" });
//     }

//     const fileDetails = Array.isArray(req.files)
//       ? req.files.map((file: any) => ({
//           filename: file.filename,
//           mimetype: file.mimetype,
//           size: file.size,
//         }))
//       : [];

//     res.json({
//       message: "Files uploaded successfully",
//       files: fileDetails,
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Error uploading files" });
//   }
// };

// export const multipleFields = async (req: any, res: Response) => {
//   try {
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//     if (!files) {
//       return res.status(400).json({ error: "No files uploaded" });
//     }

//     const response: any = {
//       message: "Files uploaded successfully",
//       files: {},
//     };

//     // Process each field's files
//     Object.keys(files).forEach((fieldname) => {
//       response.files[fieldname] = files[fieldname].map((file) => ({
//         filename: file.filename,
//         mimetype: file.mimetype,
//         size: file.size,
//       }));
//     });

//     res.json(response);
//   } catch (error) {
//     res.status(500).json({ error: "Error uploading files" });
//   }
// };

export const multipleUploads = async (req: any, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedFiles = await Promise.all(
      req.files.map(async (file: any) => {
        const imagePath = path.resolve(__dirname, "../uploads", file.filename);
        console.log(`Resolved image path: ${imagePath}`);

        const result = await cloudinary.uploader.upload(imagePath);
        return result;
      })
    );

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
};

export const multipleFields = async (req: any, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const response: any = {
      message: "Files uploaded successfully",
      files: {},
    };

    await Promise.all(
      Object.keys(files).map(async (fieldname) => {
        response.files[fieldname] = await Promise.all(
          files[fieldname].map(async (file) => {
            const imagePath = path.resolve(
              __dirname,
              "../uploads",
              file.filename
            ); // Resolve file path
            console.log(`Resolved image path for ${fieldname}: ${imagePath}`);

            const result = await cloudinary.uploader.upload(imagePath); // Upload to Cloudinary
            return result;
          })
        );
      })
    );

    res.json(response);
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
};
