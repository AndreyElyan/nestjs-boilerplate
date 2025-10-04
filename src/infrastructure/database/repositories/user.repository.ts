import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.value-object';
import { UserTypeOrmEntity } from '../typeorm/entities/user-typeorm.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private readonly repository: Repository<UserTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(page: number, limit: number): Promise<{ data: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const [entities, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: entities.map((entity) => this.toDomain(entity)),
      total,
    };
  }

  async save(user: User): Promise<User> {
    const entity = this.toTypeOrm(user);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: UserTypeOrmEntity): User {
    const email = new Email(entity.email);
    return new User(
      entity.id,
      entity.name,
      email,
      entity.createdAt,
      entity.updatedAt,
      entity.isActive,
    );
  }

  private toTypeOrm(user: User): UserTypeOrmEntity {
    const entity = new UserTypeOrmEntity();
    if (user.id) {
      entity.id = user.id;
    }
    entity.name = user.name;
    entity.email = user.email.getValue();
    entity.isActive = user.isActive;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    return entity;
  }
}
