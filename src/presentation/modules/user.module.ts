import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../controllers/user.controller';
import { CreateUserUseCase } from '@application/use-cases/create-user.use-case';
import { GetUserUseCase } from '@application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '@application/use-cases/list-users.use-case';
import { UserRepository } from '@infrastructure/database/repositories/user.repository';
import { UserTypeOrmEntity } from '@infrastructure/database/typeorm/entities/user-typeorm.entity';
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeOrmEntity])],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
