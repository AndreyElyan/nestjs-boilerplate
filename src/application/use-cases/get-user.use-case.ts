import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { AppLoggerService } from '@infrastructure/logging/logger.service';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('GetUserUseCase');
  }

  async execute(id: string): Promise<User> {
    this.logger.log(`Getting user with id: ${id}`);

    const user = await this.userRepository.findById(id);

    if (!user) {
      this.logger.warn(`User with id ${id} not found`);
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
