import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Suspension, User } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateSuspensionDto } from './dto/create-suspension.dto';

@Injectable()
export class SuspensionsService {
    constructor(
        @InjectRepository(Suspension)
        private readonly suspensionsRepository: Repository<Suspension>,
    ) {}

    async getById(suspensionId: number) {
        const suspension = await this.suspensionsRepository.findOne({ suspensionId });
        if (suspension) {
            return suspension;
        }
        throw new NotFoundException(`Suspension with this id does not exist`);
    }

    async getByUser(user: User) {
        return await this.suspensionsRepository.find({ user });
    }

    async suspend(suspension: CreateSuspensionDto) {
        const newSuspension = await this.suspensionsRepository.create(suspension);
        await this.suspensionsRepository.save(newSuspension);
        return newSuspension;
    }

    async update(id: number, attributes: Partial<Suspension>) {
        const suspension = await this.getById(id);
        if (!suspension) {
            throw new NotFoundException(`Suspension not found`);
        }

        Object.assign(suspension, attributes);
        return this.suspensionsRepository.save(suspension);
    }

    async remove(id: number) {
        const suspension = await this.getById(id);
        if (!suspension) {
            throw new NotFoundException(`User not found`);
        }
        return this.suspensionsRepository.remove(suspension);
    }
}
