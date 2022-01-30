import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as faker from 'faker';
import { Prize } from 'src/database/entities';
import { Repository } from 'typeorm';

@Injectable()
export class PrizesSeeder {
    constructor(
        @InjectRepository(Prize) private readonly prizesRepository: Repository<Prize>
    ) { }

    async seed(numberOfRows: number) {
        const createdPrizes = [];
        for (let i = 0; i < numberOfRows; ++i) {
            const prize = this.prizesRepository.create({
                currency: faker.finance.currencyCode(),
                distribution: faker.lorem.sentence(5),
            });
            createdPrizes.push(prize);
        }
        return this.prizesRepository.save(createdPrizes);
    }
}
