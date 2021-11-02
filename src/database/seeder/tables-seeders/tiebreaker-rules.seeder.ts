import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TiebreakerRule } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class TiebreakerRuleSeeder {
    constructor(
        @InjectRepository(TiebreakerRule)
        private readonly tiebreakerRuleRepository: Repository<TiebreakerRule>,
    ) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.tiebreakerRuleRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"TiebreakerRule" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "TiebreakerRule" table...`);
        const createdTiebreakerRules = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const tiebreakerRule: Partial<TiebreakerRule> = {
                rule: faker.lorem.word(10),
            };
            const newTiebreakerRule = await this.tiebreakerRuleRepository.create(tiebreakerRule);
            createdTiebreakerRules.push(newTiebreakerRule);
            await this.tiebreakerRuleRepository.save(newTiebreakerRule);
        }

        return createdTiebreakerRules;
    }
}
