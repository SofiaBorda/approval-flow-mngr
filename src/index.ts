import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import requestRoutes from "./routes/request.routes";
import userRoutes from "./routes/user.routes";

const app = express();
app.use(cors());
app.use(express.json());

AppDataSource.initialize().then(() => {
  console.log("✅Database connected");

  app.use("/requests", requestRoutes);
  app.use("/users", userRoutes);

  app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
  });
}).catch(err => console.error("❌ DB error:", err));
