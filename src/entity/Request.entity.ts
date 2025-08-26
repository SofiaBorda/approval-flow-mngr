import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { History } from "./History.entity";
import { User } from "./User.entity";

@Entity()
export class Request {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, user => user.requestsCreated, { eager: true })
  requesterUser: User;

  @ManyToOne(() => User, user => user.requestsToApprove, { eager: true })
  approverUser: User;

  @Column()
  type: string;

  @Column({ default: "Pendiente" })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => History, history => history.request, { cascade: true })
  history: History[];
}
