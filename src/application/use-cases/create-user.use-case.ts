import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { AppLoggerService } from '@infrastructure/logging/logger.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('CreateUserUseCase');
  }

  async execute(dto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${dto.email}`);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      this.logger.warn(`User with email ${dto.email} already exists`);
      throw new ConflictException('User with this email already exists');
    }

    // Create user domain entity
    const user = User.create(dto.name, dto.email);

    // Save user
    const savedUser = await this.userRepository.save(user);

    this.logger.log(`User created successfully with id: ${savedUser.id}`);
    return savedUser;
  }
}
