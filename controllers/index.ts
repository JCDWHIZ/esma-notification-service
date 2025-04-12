// export const getAllBlogs = async (req: Request, res: Response) => {
//     try {
//       const blogs = await Blog.find().populate(authorDetailsQuery);
//       return res.json({
//         success: true,
//         data: blogs,
//       });
//     } catch (error) {
//       return res.status(500).json(error);
//     }
//   };
