import swaggerAutogen from "swagger-autogen";
require("dotenv").config();

const port = process.env.PORT;
const doc = {
  info: {
    title: "My API",
    description: "API documentation",
  },
  host: "localhost:" + port,
  basePath: "/",
  produces: [
    "application/json",
    "application/xml",
    "application/x-www-form-urlencoded",
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
  schemes: ["http"],
};

const outputFile = "../swagger_output.json";
const endpointsFiles = ["../index.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger JSON generated");
});
