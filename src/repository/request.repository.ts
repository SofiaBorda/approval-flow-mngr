import { Repository } from "typeorm";
import { Request } from "../entity/Request.entity";
import { AppDataSource } from "../data-source";

export class RequestRepository extends Repository<Request> {
    constructor() {
        super(Request, AppDataSource.manager);
    }

    async findWithFilters(
        page: number,
        limit: number,
        filters: {
            search?: string;
            status?: string;
            type?: string;
            requesterId?: string;
            approverId?: string;
        }
    ) {
        console.log('Filters received in repository:', filters);

        const qb = this.createQueryBuilder("request")
            .leftJoinAndSelect("request.requesterUser", "requesterUser")
            .leftJoinAndSelect("request.approverUser", "approverUser")
            .leftJoinAndSelect("request.history", "history")
            .orderBy("request.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit);

        if (filters.search) {
            qb.andWhere(
                "(LOWER(request.title) LIKE :search OR LOWER(request.description) LIKE :search)",
                { search: `%${filters.search.toLowerCase()}%` }
            );
        }

        if (filters.status) {
            qb.andWhere("request.status = :status", { status: filters.status });
        }

        if (filters.type) {
            qb.andWhere("request.type = :type", { type: filters.type });
        }

        if (filters.requesterId) {
            qb.andWhere("requesterUser.id = :requesterId", { requesterId: filters.requesterId });
        }

        if (filters.approverId) {
            qb.andWhere("approverUser.id = :approverId", { approverId: filters.approverId });
        }

        return qb.getManyAndCount();
    }
}
