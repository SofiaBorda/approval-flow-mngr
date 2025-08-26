import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { History } from "../entity/History.entity";

export class HistoryRepository extends Repository<History> {
  constructor() {
    super(History, AppDataSource.manager);
  }
  private repo = AppDataSource.getRepository(History);

  async findByRequestId(requestId: string) {
    return this.repo.find({
      where: { request: { id: requestId } },
      order: { updateAt: "DESC" },
    });
  }
}
