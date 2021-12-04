import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipatingTeam, Team, Tournament } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { Roster } from 'src/modules/teams/teams.interface';

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
            const json: Roster = {
                "roster":
                    [
                        { "username": `example${i + 1}`, "summonerName": `Broulyy${i + 1}` },
                        { "username": `example${i + 2}`, "summonerName": `Nizashi${i + 1}` },
                        { "username": `example${i + 3}`, "summonerName": `Bogul${i + 1}` }
                    ],
                "subs":
                    [
                        { "username": `example${i + 4}`, "summonerName": `KreyVex${i + 1}` },
                        { "username": `example${i + 5}`, "summonerName": `Brzyzu v2${i + 1}` }
                    ]
            }
            const roster: Partial<ParticipatingTeam> = {
                tournament: tournaments[i],
                team: teams[i],
                signDate: faker.datatype.datetime(),
                isApproved: true,
                approvalDate: faker.datatype.datetime(),
                roster: json,
            };
            const newRoster = await this.rosterRepository.create(roster);
            createdRosters.push(newRoster);
            await this.rosterRepository.save(newRoster);
        }
        return createdRosters;
    }
}
