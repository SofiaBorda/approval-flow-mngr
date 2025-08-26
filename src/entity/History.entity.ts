import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { Request } from "./Request.entity";
import { User } from "./User.entity";

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  updateAt: Date;

  @Column({ type: "varchar", default: "" })
  action: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => Request, request => request.history, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "request_id" })
  request: Request;
}
