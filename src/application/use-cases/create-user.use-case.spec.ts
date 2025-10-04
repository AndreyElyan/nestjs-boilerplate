import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository, USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.value-object';
import { AppLoggerService } from '@infrastructure/logging/logger.service';
import { ConfigService } from '@nestjs/config';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepository: jest.Mocked<IUserRepository> = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        AppLoggerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, unknown> = {
                LOG_FORMAT: 'json',
                LOG_LEVEL: 'debug',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get(USER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a new user successfully', async () => {
      const dto = { name: 'John Doe', email: 'john@example.com' };
      const expectedUser = new User(
        '123',
        dto.name,
        new Email(dto.email),
        new Date(),
        new Date(),
        true,
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(expectedUser);

      const result = await useCase.execute(dto);

      expect(result).toEqual(expectedUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const dto = { name: 'John Doe', email: 'john@example.com' };
      const existingUser = new User(
        '123',
        dto.name,
        new Email(dto.email),
        new Date(),
        new Date(),
        true,
      );

      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
