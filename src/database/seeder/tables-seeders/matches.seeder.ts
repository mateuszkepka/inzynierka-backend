import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, ParticipatingTeam, Tournament } from 'src/database/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class MatchesSeeder {
    constructor(@InjectRepository(Match) private readonly matchesRepository: Repository<Match>) {}

    async seed(numberOfRows: number, rosters: ParticipatingTeam[], tournaments: Tournament[]) {
        const isSeeded = await this.matchesRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Match" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Match" table...`);
        const createdMatches = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const rand = Math.floor(Math.random() * 10);
            const rand2 = Math.floor(Math.random() * 10);
            const match: Partial<Match> = {
                matchStartDate: faker.datatype.datetime(),
                matchEndDate: faker.datatype.datetime(),
                //tournamentStage: faker.hacker.verb(),
                //matchResult: faker.hacker.adjective(),
                tournament: tournaments[i],
                firstRoster: rosters[rand],
                secondRoster: rosters[rand2],
            };

            const newMatch = await this.matchesRepository.create(match);
            createdMatches.push(newMatch);
            await this.matchesRepository.save(newMatch);
        }
        return createdMatches;
    }
}
