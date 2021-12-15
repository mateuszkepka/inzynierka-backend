import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipatingTeam, Team, Tournament } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class ParticipatingTeamSeeder {
    constructor(
        @InjectRepository(ParticipatingTeam)
        private readonly rosterRepository: Repository<ParticipatingTeam>,
    ) { }

    async seed(numberOfRows: number, tournaments: Tournament[], teams: Team[]) {
        const isSeeded = await this.rosterRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"ParticipatingTeam" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "ParticipatingTeam" table...`);
        const createdRosters = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const json = {
                "roster":
                    [
                        { "userId": i + 1, "playerId": i + 1 },
                        { "userId": i + 2, "playerId": i + 2 },
                        { "userId": i + 3, "playerId": i + 3 },
                    ],
                "subs":
                    [
                        { "userId": i + 4, "playerId": i + 4 },
                        { "userId": i + 5, "playerId": i + 5 },
                    ]
            }
            const roster: Partial<ParticipatingTeam> = {
                tournament: tournaments[i],
                team: teams[i],
                signDate: faker.datatype.datetime(),
                isApproved: true,
                decisionDate: faker.datatype.datetime()
            };
            const newRoster = await this.rosterRepository.create(roster);
            createdRosters.push(newRoster);
            await this.rosterRepository.save(newRoster);
        }
        return createdRosters;
    }
}
