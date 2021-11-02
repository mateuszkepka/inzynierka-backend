import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group, GroupRule, TiebreakerRule } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class GroupRuleSeeder {
    constructor(
        @InjectRepository(GroupRule) private readonly groupRuleRepository: Repository<GroupRule>,
    ) {}

    async seed(numberOfRows: number, groups: Group[], tiebreakerRules: TiebreakerRule[]) {
        const isSeeded = await this.groupRuleRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"GroupRule" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "GroupRule" table...`);
        const createdGroupRules = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const rand = Math.floor(Math.random() * (3) + 1)
            const groupRule: Partial<GroupRule> = {
                rulePriority: rand,
                group: groups[i],
                tiebreakerRule: tiebreakerRules[i],
            };
            const newGroupRule = await this.groupRuleRepository.create(groupRule);
            createdGroupRules.push(newGroupRule);
            await this.groupRuleRepository.save(newGroupRule);
        }
        return createdGroupRules;
    }
}
