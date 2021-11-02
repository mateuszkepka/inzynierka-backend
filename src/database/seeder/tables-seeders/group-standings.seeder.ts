import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group, GroupStanding, Team } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class GroupStandingSeeder {
    constructor(
        @InjectRepository(GroupStanding)
        private readonly groupStandingRepository: Repository<GroupStanding>,
    ) {}

    async seed(numberOfRows: number, teams: Team[], groups: Group[]) {
        const isSeeded = await this.groupStandingRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"GroupStanding" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "GroupStanding" table...`);
        const createdGroupStandings = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const groupStanding: Partial<GroupStanding> = {
                place: 1,
                points: faker.datatype.number(),
                group: groups[i],
                team: teams[i],
            };
            const newGroupStanding = await this.groupStandingRepository.create(groupStanding);
            createdGroupStandings.push(newGroupStanding);
            await this.groupStandingRepository.save(newGroupStanding);
        }
        return createdGroupStandings;
    }
}
