// import mongoose, { Schema, model } from "mongoose";

// export interface Blog {
//   title: string;
//   content: string;
//   datePosted: Date;
//   image: string;
//   author: string;
//   comments: Schema.Types.ObjectId[];
//   categories: mongoose.Types.ObjectId[];
// }

// const BlogSchema: Schema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     content: {
//       type: String,
//       required: true,
//     },
//     datePosted: {
//       type: Date,
//       default: Date.now,
//     },
//     status: {
//       type: String,
//       default: "draft",
//       enum: [
//         "draft",
//         "published",
//         // "scheduled",
//         // "archived",
//         "deleted",
//       ],
//     },
//     image: {
//       type: String,
//       required: true,
//     },
//     author: {
//       ref: "User",
//       type: Schema.Types.ObjectId,
//     },
//     comments: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Comment",
//       },
//     ],
//     categories: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Category",
//       },
//     ],
//   },
//   { timestamps: true }
// );

// export default model<Blog>("Blog", BlogSchema);
