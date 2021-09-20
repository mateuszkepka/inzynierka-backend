import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Suspension } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class SuspensionsSeeder {
    constructor(
        @InjectRepository(Suspension)
        private readonly suspensionsRepository: Repository<Suspension>,
    ) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.suspensionsRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Suspension" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Suspension" table...`);

        for (let i = 0; i < numberOfRows; ++i) {
            const suspension: Partial<Suspension> = {
                suspensionStartDate: faker.datatype.datetime(),
                suspensionEndDate: faker.datatype.datetime(),
                reason: faker.lorem.sentences(5),
            };
            const newSuspension = await this.suspensionsRepository.create(suspension);
            await this.suspensionsRepository.save(newSuspension);
        }
    }
}
