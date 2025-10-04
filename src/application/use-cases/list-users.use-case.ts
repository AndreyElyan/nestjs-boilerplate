import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { AppLoggerService } from '@infrastructure/logging/logger.service';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('ListUsersUseCase');
  }

  async execute(page: number = 1, limit: number = 10): Promise<{ data: User[]; total: number }> {
    this.logger.log(`Listing users - page: ${page}, limit: ${limit}`);

    const result = await this.userRepository.findAll(page, limit);

    this.logger.log(`Found ${result.total} users`);
    return result;
  }
}
