import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Suspension, User } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class SuspensionsSeeder {
    constructor(
        @InjectRepository(Suspension)
        private readonly suspensionsRepository: Repository<Suspension>,
    ) {}

    async seed(numberOfRows: number, users: User[]) {
        const isSeeded = await this.suspensionsRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Suspension" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Suspension" table...`);
        const createdSuspensions = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const suspension: Partial<Suspension> = {
                suspensionStartDate: faker.datatype.datetime(),
                suspensionEndDate: faker.datatype.datetime(),
                reason: faker.lorem.sentences(5),
                user: users[i],
            };
            const newSuspension = await this.suspensionsRepository.create(suspension);
            createdSuspensions.push(newSuspension);
            await this.suspensionsRepository.save(newSuspension);
        }
        return createdSuspensions;
    }
}
