import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Prize, Tournament } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class PrizesSeeder {
    constructor(@InjectRepository(Prize) private readonly prizesRepository: Repository<Prize>) {}

    async seed(numberOfRows: number, tournaments: Tournament[]) {
        const isSeeded = await this.prizesRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Prize" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Prize" table...`);
        const createdPrizes = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const prize: Partial<Prize> = {
                currency: faker.finance.currencyCode(),
                distribution: faker.lorem.word(1),
                tournament: tournaments[i],
            };
            const newPrize = await this.prizesRepository.create(prize);
            createdPrizes.push(newPrize);
            await this.prizesRepository.save(newPrize);
        }
        return createdPrizes;
    }
}
