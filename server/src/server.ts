import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` API Documentation: http://localhost:${PORT}/api/v1`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
});


process.on("SIGTERM", () => {
  console.log(" SIGTERM received. Closing server...");
  server.close(() => {
    console.log(" Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log(" SIGINT received. Closing server...");
  server.close(() => {
    console.log(" Server closed");
    process.exit(0);
  });
});