import { RequestService } from '../../services/Request.service';
import { Request } from '../../entity/Request.entity';
import { User, UserRole } from '../../entity/User.entity';

const mockRequestRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    findWithFilters: jest.fn(),
    findOne: jest.fn(),
};
const mockHistoryRepo = {
    create: jest.fn(),
    save: jest.fn(),
};
const mockUserRepo = {
    findOneBy: jest.fn(),
};

jest.mock('../../repository/request.repository', () => ({
    RequestRepository: jest.fn(() => mockRequestRepo),
}));
jest.mock('../../repository/history.repository', () => ({
    HistoryRepository: jest.fn(() => mockHistoryRepo),
}));
jest.mock('../../data-source', () => ({
    AppDataSource: {
        getRepository: () => mockUserRepo,
    },
}));

describe('RequestService', () => {
    let service: RequestService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new RequestService();
    });

    describe('create', () => {
        it('should create, save request and history', async () => {
            const user = { id: 'u1', username: 'test' } as User;
            const newRequest = { id: 'r1', title: 'Solicitud' } as Request;
            mockRequestRepo.create.mockReturnValue(newRequest);
            mockRequestRepo.save.mockResolvedValue(newRequest);
            mockUserRepo.findOneBy.mockResolvedValue(user);
            mockHistoryRepo.create.mockReturnValue({ id: 'h1' });
            mockHistoryRepo.save.mockResolvedValue({ id: 'h1' });

            const result = await service.create({ requesterUser: user, title: 'Solicitud' });

            expect(mockRequestRepo.create).toHaveBeenCalled();
            expect(mockRequestRepo.save).toHaveBeenCalledWith(newRequest);
            expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: user.id });
            expect(mockHistoryRepo.create).toHaveBeenCalledWith({
                action: 'Creado',
                user,
                request: newRequest,
            });
            expect(mockHistoryRepo.save).toHaveBeenCalled();
            expect(result).toBe(newRequest);
        });
    });

    it('should throw if user not found', async () => {
        const request = { id: 'r1', status: 'Rechazado' } as Request;
        mockRequestRepo.findOneBy.mockResolvedValue(request);
        mockUserRepo.findOneBy.mockResolvedValueOnce({ id: 'a1' });
        mockUserRepo.findOneBy.mockResolvedValueOnce(null);

        await expect(
            service.update('r1', {
                approverUser: {
                    id: 'a1',
                    username: 'aprobador',
                    password: '123',
                    role: UserRole.SOLICITANTE,
                    createdAt: new Date(),
                    requestsCreated: [],
                    requestsToApprove: [],
                }
            }, 'u1')
        ).rejects.toThrow('User not found');
    });


    describe('findAllWithFilters', () => {
        it('should return paginated requests', async () => {
            mockRequestRepo.findWithFilters.mockResolvedValue([[{ id: 'r1' }], 1]);
            const user = { role: 'solicitante', userId: 'u1' };
            const filters = {};

            const result = await service.findAllWithFilters(1, 5, filters, user);

            expect(mockRequestRepo.findWithFilters).toHaveBeenCalledWith(1, 5, { requesterId: 'u1' });
            expect(result).toEqual({
                data: [{ id: 'r1' }],
                count: 1,
                page: 1,
                limit: 5,
                totalPages: 1,
            });
        });
    });

    describe('findById', () => {
        it('should return request with relations', async () => {
            const request = { id: 'r1' };
            mockRequestRepo.findOne.mockResolvedValue(request);

            const result = await service.findById('r1');

            expect(mockRequestRepo.findOne).toHaveBeenCalledWith({
                where: { id: 'r1' },
                relations: ['history', 'history.user', 'requesterUser', 'approverUser'],
            });
            expect(result).toBe(request);
        });
    });

    describe('updateStatus', () => {
        it('should update status and save history', async () => {
            const request = { id: 'r1', status: 'Pendiente' } as Request;
            const user = { id: 'u1' } as User;
            mockRequestRepo.findOneBy.mockResolvedValue(request);
            mockRequestRepo.save.mockResolvedValue(request);
            mockUserRepo.findOneBy.mockResolvedValue(user);
            mockHistoryRepo.create.mockReturnValue({ id: 'h1' });
            mockHistoryRepo.save.mockResolvedValue({ id: 'h1' });

            const result = await service.updateStatus('r1', 'Aprobado', 'u1', 'Comentario');

            expect(mockRequestRepo.findOneBy).toHaveBeenCalledWith({ id: 'r1' });
            expect(mockRequestRepo.save).toHaveBeenCalledWith(request);
            expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: 'u1' });
            expect(mockHistoryRepo.create).toHaveBeenCalledWith({
                action: 'Aprobado',
                user,
                comment: 'Comentario',
                request,
            });
            expect(mockHistoryRepo.save).toHaveBeenCalled();
            expect(result).toBe(request);
        });

        it('should throw if request not found', async () => {
            mockRequestRepo.findOneBy.mockResolvedValue(null);

            await expect(service.updateStatus('r1', 'Aprobado', 'u1')).rejects.toThrow('Request not found');
        });

        it('should throw if user not found', async () => {
            mockRequestRepo.findOneBy.mockResolvedValue({ id: 'r1' });
            mockUserRepo.findOneBy.mockResolvedValue(null);

            await expect(service.updateStatus('r1', 'Aprobado', 'u1')).rejects.toThrow('User not found');
        });
    });

    describe('update', () => {
        it('should update request and save history', async () => {
            const request = { id: 'r1', status: 'Rechazado', title: 'Old', description: 'Old', type: 'Old' } as Request;
            const user = { id: 'u1' } as User;
            mockRequestRepo.findOneBy.mockResolvedValue(request);
            mockRequestRepo.save.mockResolvedValue(request);
            mockUserRepo.findOneBy.mockResolvedValue(user);
            mockHistoryRepo.create.mockReturnValue({ id: 'h1' });
            mockHistoryRepo.save.mockResolvedValue({ id: 'h1' });

            const data = { title: 'New', description: 'New', type: 'New' };
            const result = await service.update('r1', data, 'u1');

            expect(request.title).toBe('New');
            expect(request.description).toBe('New');
            expect(request.type).toBe('New');
            expect(request.status).toBe('Pendiente');
            expect(mockRequestRepo.save).toHaveBeenCalledWith(request);
            expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: 'u1' });
            expect(mockHistoryRepo.create).toHaveBeenCalledWith({
                action: 'Actualizado',
                user,
                request,
            });
            expect(mockHistoryRepo.save).toHaveBeenCalled();
            expect(result).toBe(request);
        });

        it('should throw if request not found', async () => {
            mockRequestRepo.findOneBy.mockResolvedValue(null);

            await expect(service.update('r1', {}, 'u1')).rejects.toThrow('Request not found');
        });

        it('should throw if request status is not Rechazado', async () => {
            mockRequestRepo.findOneBy.mockResolvedValue({ id: 'r1', status: 'Pendiente' });

            await expect(service.update('r1', {}, 'u1')).rejects.toThrow('Solo se pueden modificar solicitudes rechazadas');
        });

        it('should throw if approver not found', async () => {
            const request = { id: 'r1', status: 'Rechazado' } as Request;
            mockRequestRepo.findOneBy.mockResolvedValue(request);
            mockUserRepo.findOneBy.mockResolvedValueOnce(null);

            await expect(
                service.update('r1', {
                    approverUser: {
                        id: 'a1',
                        username: 'aprobador',
                        password: '123',
                        role: UserRole.SOLICITANTE,
                        createdAt: new Date(),
                        requestsCreated: [],
                        requestsToApprove: [],
                    }
                }, 'u1')
            ).rejects.toThrow('Aprobador no encontrado');
        });

        it('should throw if user not found', async () => {
            const request = { id: 'r1', status: 'Rechazado' } as Request;
            mockRequestRepo.findOneBy.mockResolvedValue(request);
            mockUserRepo.findOneBy.mockResolvedValueOnce({ id: 'a1' });
            mockUserRepo.findOneBy.mockResolvedValueOnce(null);

            await expect(
                service.update('r1', {
                    approverUser: {
                        id: 'a1',
                        username: 'aprobador',
                        password: '123',
                        role: UserRole.SOLICITANTE,
                        createdAt: new Date(),
                        requestsCreated: [],
                        requestsToApprove: [],
                    }
                }, 'u1')
            ).rejects.toThrow('User not found');
        });
    });
});