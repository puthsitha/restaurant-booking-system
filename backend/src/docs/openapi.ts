import path from "node:path";

import swaggerJsdoc from "swagger-jsdoc";

import { env } from "../env";

// Glob matches both .ts (dev, via nodemon/ts-node) and compiled .js
// (production build) route/docs files, since swagger-jsdoc reads JSDoc
// comments as plain text rather than executing the code.
export const openapiSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "TableSite API",
      version: "0.1.0",
      description:
        "Cambodian restaurant booking platform API (diner + admin).",
    },
    servers: [{ url: `http://localhost:${env.port}` }],
  },
  apis: [
    path.join(__dirname, "../routes/*.{ts,js}"),
    path.join(__dirname, "./schemas.{ts,js}"),
  ],
});
