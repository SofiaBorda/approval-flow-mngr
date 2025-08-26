import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User.entity";
import { Request } from "./entity/Request.entity";
import { History } from "./entity/History.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",      // <-- usa variable de entorno
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "approval_flow",
  logging: false,
  entities: [User, Request, History],
});
