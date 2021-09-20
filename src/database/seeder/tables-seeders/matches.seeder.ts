import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class MatchesSeeder {
    constructor(@InjectRepository(Match) private readonly matchesRepository: Repository<Match>) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.matchesRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Match" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Match" table...`);

        for (let i = 0; i < numberOfRows; ++i) {
            const match: Partial<Match> = {
                matchStartDate: faker.datatype.datetime(),
                matchEndDate: faker.datatype.datetime(),
                tournamentStage: faker.hacker.verb(),
                matchResult: faker.hacker.adjective(),
            };

            const newMatch = await this.matchesRepository.create(match);
            await this.matchesRepository.save(newMatch);
        }
    }
}
