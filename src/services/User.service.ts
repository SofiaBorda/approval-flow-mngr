import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User.entity";

export class UserService {
  private userRepo = AppDataSource.getRepository(User);

  async create(data: Partial<User>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async findById(id: string) {
    return this.userRepo.findOneBy({ id });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { username, password },
    });
  }

  async findApprovers(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.APROBADOR },
      select: ["id", "username", "role"],
    });
  }
}
