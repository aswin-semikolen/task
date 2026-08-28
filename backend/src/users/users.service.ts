import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Brackets, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    await this.assertEmailIsAvailable(dto.email);

    const user = this.usersRepository.create({
      ...dto,
      password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
    });
    const saved = await this.usersRepository.save(user);

    // `save` echoes back the entity it was given, hash included — re-read so the
    // response goes through the `select: false` column definition.
    return this.findOne(saved.id);
  }

  async findAll(query: QueryUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.usersRepository.createQueryBuilder('user');

    if (query.search) {
      const search = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((w) =>
          w
            .where('LOWER(user.first_name) LIKE :search', { search })
            .orWhere('LOWER(user.last_name) LIKE :search', { search })
            .orWhere('LOWER(user.email) LIKE :search', { search }),
        ),
      );
    }
    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }
    if (query.gender) {
      qb.andWhere('user.gender = :gender', { gender: query.gender });
    }

    const [data, total] = await qb
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} was not found`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.email && dto.email !== user.email) {
      await this.assertEmailIsAvailable(dto.email);
    }

    const { password, ...rest } = dto;
    Object.assign(user, rest);

    // Only re-hash when a new password was actually supplied.
    if (password) {
      user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    await this.usersRepository.save(user);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }
  }

  private async assertEmailIsAvailable(email: string): Promise<void> {
    const exists = await this.usersRepository.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException('A user with this email already exists');
    }
  }
}
