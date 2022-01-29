import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Suspension, User } from 'src/database/entities';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { SuspensionStatus } from './dto/suspension-status.enum';

@Injectable()
export class SuspensionsService {
    constructor(
        @InjectRepository(Suspension)
        private readonly suspensionsRepository: Repository<Suspension>,
        private readonly usersService: UsersService,
    ) { }

    async getById(suspensionId: number) {
        const suspension = await this.suspensionsRepository.findOne({
            relations: [`user`, `admin`],
            where: { suspensionId: suspensionId },
        });
        if (!suspension) {
            throw new NotFoundException(`Suspension with this id does not exist`);
        }
        return suspension;
    }

    async getFiltered(userId: number, status: SuspensionStatus) {
        const queryBuilder = this.suspensionsRepository
            .createQueryBuilder(`suspension`)
            .innerJoinAndSelect(`suspension.user`, `user`)
            .innerJoinAndSelect(`suspension.admin`, `admin`)
            .where(`1=1`);
        if (userId) {
            const user = await this.usersService.getById(userId);
            queryBuilder.andWhere(`user.userId = :userId`, { userId: user.userId });
        }
        switch (status) {
            case SuspensionStatus.Active:
                queryBuilder.andWhere(`suspension.startDate <= :date1`, { date1: new Date() });
                queryBuilder.andWhere(`suspension.endDate >= :date2`, { date2: new Date() });
                break;
            case SuspensionStatus.Past:
                queryBuilder.andWhere(`suspension.endDate < :date`, { date: new Date() });
                break;
            default:
                break;
        }
        const suspensions = await queryBuilder.getMany();
        return suspensions;
    }

    async create(body: CreateSuspensionDto, admin: User) {
        const user = await this.usersService.getById(body.userId);
        const suspension = this.suspensionsRepository.create({
            endDate: body.endDate,
            reason: body.reason,
            user: user,
            admin: admin,
        });
        return await this.suspensionsRepository.save(suspension);
    }

    async update(id: number, attrs: Partial<Suspension>) {
        const suspension = await this.getById(id);
        Object.assign(suspension, attrs);
        return this.suspensionsRepository.save(suspension);
    }

    async remove(id: number) {
        const suspension = await this.getById(id);
        return this.suspensionsRepository.remove(suspension);
    }
}
