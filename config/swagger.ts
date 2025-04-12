//   import swaggerAutogen from "swagger-autogen";
//   require("dotenv").config();

//   // const port = process.env.PORT;
//   // const doc = {
//   //   openapi: "3.1.0",
//   //   info: {
//   //     title: "Esma Shared",
//   //     description: "API documentation",
//   //     version: "1.0.0",
//   //   },
//   //   servers: [
//   //     {
//   //       url: "/shared",
//   //       description: "Default Server (relative URL)",
//   //     },
//   //   ],
//   //   components: {
//   //     securitySchemes: {
//   //       bearerAuth: {
//   //         type: "http",
//   //         scheme: "bearer",
//   //       },
//   //     },
//   //   },
//   //   // Removed 'produces'
//   // };
//   // swaggerDef.ts
// export const swaggerDefinition = {
//   openapi: "3.1.0",
//   info: {
//     title: "Esma Shared",
//     description: "API documentation",
//     version: "1.0.0",
//   },
//   servers: [
//     {
//       url: "/shared",
//       description: "Default Server (relative URL)",
//     },
//   ],
//   components: {
//     securitySchemes: {
//       bearerAuth: {
//         type: "http",
//         scheme: "bearer",
//       },
//     },
//   },
// };

//   const outputFile = "../swagger_output.json";
//   const endpointsFiles = ["../index.ts"];

//   swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
//     console.log("Swagger JSON generated");
//   });
