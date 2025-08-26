import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User.entity";
import { Request } from "./entity/Request.entity";
import { History } from "./entity/History.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres", 
  password: "password",
  database: "approval_flow",
  synchronize: true,
  logging: false,
  entities: [User, Request, History],
});
