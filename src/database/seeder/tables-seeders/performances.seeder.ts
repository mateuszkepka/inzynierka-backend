import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { Map, Performance, Player } from 'src/entities';

@Injectable()
export class PerformancesSeeder {
    constructor(
        @InjectRepository(Performance)
        private readonly performancesRepository: Repository<Performance>,
    ) {}

    async seed(numberOfRows: number, players: Player[], maps: Map[]) {
        const isSeeded = await this.performancesRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Performance" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Performance" table...`);
        const createdPerformances = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const performance: Partial<Performance> = {
                kills: faker.datatype.number(),
                deaths: faker.datatype.number(),
                assists: faker.datatype.number(),
                map: maps[i],
            };
            const newPerformance = await this.performancesRepository.create(performance);
            createdPerformances.push(newPerformance);
            await this.performancesRepository.save(newPerformance);
        }
        return createdPerformances;
    }
}
