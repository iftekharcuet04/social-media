import { registerAs } from "@nestjs/config";

export default registerAs("api", () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  version: process.env.API_VERSION || "1",
  apiPrefix: process.env.API_PREFIX || "api",
}));
