import { AppDataSource } from "../data-source";
import { Request } from "../entity/Request.entity";
import { User } from "../entity/User.entity";
import { RequestRepository } from "../repository/request.repository";
import { HistoryRepository } from "../repository/history.repository";

export class RequestService {
    private requestRepo = new RequestRepository();
    private historyRepo = new HistoryRepository();

    async create(data: Partial<Request>) {
        const newRequest = this.requestRepo.create(data);
        await this.requestRepo.save(newRequest);
        const requester = await AppDataSource.getRepository(User).findOneBy({ id: data.requesterUser?.id });

        if (!requester) throw new Error("User not found");
        const entry = this.historyRepo.create({
            action: "Creado",
            user: requester,
            request: newRequest
        });

        await this.historyRepo.save(entry);
        return newRequest;
    }

    async findAllWithFilters(page: number = 1, limit: number = 5, filters, user) {
        if (user.role === "solicitante") filters.requesterId = user.userId;
        else if (user.role === "aprobador") filters.approverId = user.userId;
        const [data, count] = await this.requestRepo.findWithFilters(page, limit, filters);

        return {
            data,
            count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        };
    }

    async findById(id: string) {
        return this.requestRepo.findOne({
            where: { id },
            relations: ["history", "history.user", "requesterUser", "approverUser"],
        });
    }

    async updateStatus(id: string, status: string, userId: string, comment?: string) {
        const request = await this.requestRepo.findOneBy({ id });
        if (!request) throw new Error("Request not found");
        request.status = status;

        await this.requestRepo.save(request);
        const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
        console.log('alo usuario', user);

        if (!user) throw new Error("User not found");
        const entry = this.historyRepo.create({
            action: status, 
            user,           
            comment,        
            request         
        });
        await this.historyRepo.save(entry);
        return request;
    }

    async update(id: string, data: Partial<Request>, userId: string) {
        const request = await this.requestRepo.findOneBy({ id });
        if (!request) throw new Error("Request not found");
        if (request.status !== "Rechazado") {
            throw new Error("Solo se pueden modificar solicitudes rechazadas");
        }

        request.title = data.title ?? request.title;
        request.description = data.description ?? request.description;
        request.type = data.type ?? request.type;

        if (data.approverUser?.id) {
            const approver = await AppDataSource.getRepository(User).findOneBy({ id: data.approverUser.id });
            if (!approver) throw new Error("Aprobador no encontrado");
            request.approverUser = approver;
        }

        request.status = "Pendiente";
        await this.requestRepo.save(request);

        const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
        if (!user) throw new Error("User not found");
        const entry = this.historyRepo.create({
            action: "Actualizado",
            user,
            request,
        });
        await this.historyRepo.save(entry);
        return request;
    }
}
