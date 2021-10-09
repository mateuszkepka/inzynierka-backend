import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TiebrakerRule } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class TiebrakerRuleSeeder {
    constructor(
        @InjectRepository(TiebrakerRule)
        private readonly tiebrakerRuleRepository: Repository<TiebrakerRule>,
    ) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.tiebrakerRuleRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"TiebrakerRule" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "TiebrakerRule" table...`);
        const createdTiebrakerRules = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const tiebrakerRule: Partial<TiebrakerRule> = {
                rule: faker.lorem.word(10),
            };
            const newTiebrakerRule = await this.tiebrakerRuleRepository.create(tiebrakerRule);
            createdTiebrakerRules.push(newTiebrakerRule);
            await this.tiebrakerRuleRepository.save(newTiebrakerRule);
        }

        return createdTiebrakerRules;
    }
}
