import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Request } from "./Request.entity";

export enum UserRole {
  SOLICITANTE = "solicitante",
  APROBADOR = "aprobador",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.SOLICITANTE,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Request, (request) => request.requesterUser)
  requestsCreated: Request[];

  @OneToMany(() => Request, (request) => request.approverUser)
  requestsToApprove: Request[];
}
