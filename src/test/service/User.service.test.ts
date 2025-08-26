import { UserService } from "../../services/User.service";
import { UserRole } from "../../entity/User.entity";

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

jest.mock('../../data-source', () => ({
  AppDataSource: {
    getRepository: () => mockRepo,
  },
}));

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  describe('create', () => {
    it('should create and save user', async () => {
      const userData = { username: 'test', password: '123' };
      const userEntity = { ...userData, id: '1' };
      mockRepo.create.mockReturnValue(userEntity);
      mockRepo.save.mockResolvedValue(userEntity);

      const result = await service.create(userData);

      expect(mockRepo.create).toHaveBeenCalledWith(userData);
      expect(mockRepo.save).toHaveBeenCalledWith(userEntity);
      expect(result).toEqual(userEntity);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userEntity = { id: '1', username: 'test' };
      mockRepo.findOneBy.mockResolvedValue(userEntity);

      const result = await service.findById('1');

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual(userEntity);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const userEntity = { id: '1', username: 'test', password: '123' };
      mockRepo.findOne.mockResolvedValue(userEntity);

      const result = await service.validateUser('test', '123');

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { username: 'test', password: '123' } });
      expect(result).toEqual(userEntity);
    });

    it('should return null if credentials are invalid', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.validateUser('test', 'wrong');

      expect(result).toBeNull();
    });
  });

  describe('findApprovers', () => {
    it('should return users with role APROBADOR', async () => {
      const approvers = [
        { id: '2', username: 'approver', role: UserRole.APROBADOR },
      ];
      mockRepo.find.mockResolvedValue(approvers);

      const result = await service.findApprovers();

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { role: UserRole.APROBADOR },
        select: ['id', 'username', 'role'],
      });
      expect(result).toEqual(approvers);
    });
  });
});