import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { Performance } from 'src/entities';

@Injectable()
export class PerformancesSeeder {
    constructor(
        @InjectRepository(Performance)
        private readonly performancesRepository: Repository<Performance>,
    ) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.performancesRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Performance" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Performance" table...`);

        for (let i = 0; i < numberOfRows; ++i) {
            const performance: Partial<Performance> = {
                kills: faker.datatype.number(),
                deaths: faker.datatype.number(),
                assists: faker.datatype.number(),
            };
            const newPerformance = await this.performancesRepository.create(performance);
            await this.performancesRepository.save(newPerformance);
        }
    }
}
