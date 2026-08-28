import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Gender, UserStatus } from '../common/enums';
import { User } from '../users/entities/user.entity';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  /** Headline counts, computed across the whole table rather than one page. */
  async summary() {
    const [total, active, inactive, newLast30Days, genderRows] =
      await Promise.all([
        this.usersRepository.count(),
        this.usersRepository.count({ where: { status: UserStatus.ACTIVE } }),
        this.usersRepository.count({ where: { status: UserStatus.INACTIVE } }),
        this.countRegisteredSince(30),
        this.usersRepository
          .createQueryBuilder('user')
          .select('user.gender', 'gender')
          .addSelect('COUNT(*)', 'count')
          .groupBy('user.gender')
          .getRawMany<{ gender: Gender; count: number }>(),
      ]);

    const byGender = Object.values(Gender).map((gender) => {
      const count = Number(
        genderRows.find((row) => row.gender === gender)?.count ?? 0,
      );
      return {
        gender,
        count,
        percentage: total ? Math.round((count / total) * 100) : 0,
      };
    });

    return { total, active, inactive, newLast30Days, byGender };
  }

  /** Detail rows for the report table, filtered by the same criteria as the cards. */
  async list(query: ReportQueryDto) {
    const qb = this.usersRepository.createQueryBuilder('user');
    this.applyFilters(qb, query);

    const [data, total] = await qb
      .orderBy('user.created_at', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  private applyFilters(qb: SelectQueryBuilder<User>, query: ReportQueryDto) {
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
  }

  private countRegisteredSince(days: number): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.created_at >= :since', { since })
      .getCount();
  }
}
