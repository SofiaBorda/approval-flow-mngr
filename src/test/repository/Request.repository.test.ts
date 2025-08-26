import { RequestRepository } from '../../repository/request.repository';
import { Request } from '../../entity/Request.entity';

describe('RequestRepository', () => {
  let repo: RequestRepository;

  beforeEach(() => {
    repo = new RequestRepository();
  });

  it('should build query with filters and return results', async () => {
    // Mock del query builder y sus métodos encadenados
    const mockQb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'r1' }], 1]),
    };

    // Mockea el método createQueryBuilder
    jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQb);

    const filters = {
      search: 'test',
      status: 'Pendiente',
      type: 'TipoA',
      requesterId: 'u1',
      approverId: 'u2',
    };

    const result = await repo.findWithFilters(1, 5, filters);

    expect(repo.createQueryBuilder).toHaveBeenCalledWith('request');
    expect(mockQb.leftJoinAndSelect).toHaveBeenCalledWith('request.requesterUser', 'requesterUser');
    expect(mockQb.leftJoinAndSelect).toHaveBeenCalledWith('request.approverUser', 'approverUser');
    expect(mockQb.leftJoinAndSelect).toHaveBeenCalledWith('request.history', 'history');
    expect(mockQb.orderBy).toHaveBeenCalledWith('request.createdAt', 'DESC');
    expect(mockQb.skip).toHaveBeenCalledWith(0);
    expect(mockQb.take).toHaveBeenCalledWith(5);
    expect(mockQb.andWhere).toHaveBeenCalledWith(
      '(LOWER(request.title) LIKE :search OR LOWER(request.description) LIKE :search)',
      { search: '%test%' }
    );
    expect(mockQb.andWhere).toHaveBeenCalledWith('request.status = :status', { status: 'Pendiente' });
    expect(mockQb.andWhere).toHaveBeenCalledWith('request.type = :type', { type: 'TipoA' });
    expect(mockQb.andWhere).toHaveBeenCalledWith('requesterUser.id = :requesterId', { requesterId: 'u1' });
    expect(mockQb.andWhere).toHaveBeenCalledWith('approverUser.id = :approverId', { approverId: 'u2' });
    expect(result).toEqual([[{ id: 'r1' }], 1]);
  });

  it('should build query without optional filters', async () => {
    const mockQb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQb);

    const filters = {};

    const result = await repo.findWithFilters(2, 10, filters);

    expect(repo.createQueryBuilder).toHaveBeenCalledWith('request');
    expect(mockQb.skip).toHaveBeenCalledWith(10);
    expect(mockQb.take).toHaveBeenCalledWith(10);
    expect(result).toEqual([[], 0]);
  });
  it('should build query with only search filter', async () => {
  const mockQb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'r1' }], 1]),
  };
  jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQb);

  const filters = { search: 'test' };
  await repo.findWithFilters(1, 5, filters);

  expect(mockQb.andWhere).toHaveBeenCalledWith(
    '(LOWER(request.title) LIKE :search OR LOWER(request.description) LIKE :search)',
    { search: '%test%' }
  );
});

it('should build query with only status filter', async () => {
  const mockQb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'r1' }], 1]),
  };
  jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQb);

  const filters = { status: 'Pendiente' };
  await repo.findWithFilters(1, 5, filters);

  expect(mockQb.andWhere).toHaveBeenCalledWith('request.status = :status', { status: 'Pendiente' });
});

it('should build query with only type filter', async () => {
  const mockQb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'r1' }], 1]),
  };
  jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQb);

  const filters = { type: 'TipoA' };
  await repo.findWithFilters(1, 5, filters);

  expect(mockQb.andWhere).toHaveBeenCalledWith('request.type = :type', { type: 'TipoA' });
});

it('should build query with only requesterId filter', async () => {
  const mockQb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'r1' }], 1]),
  };
  jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQb);

  const filters = { requesterId: 'u1' };
  await repo.findWithFilters(1, 5, filters);

  expect(mockQb.andWhere).toHaveBeenCalledWith('requesterUser.id = :requesterId', { requesterId: 'u1' });
});

it('should build query with only approverId filter', async () => {
  const mockQb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'r1' }], 1]),
  };
  jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQb);

  const filters = { approverId: 'u2' };
  await repo.findWithFilters(1, 5, filters);

  expect(mockQb.andWhere).toHaveBeenCalledWith('approverUser.id = :approverId', { approverId: 'u2' });
});
});

