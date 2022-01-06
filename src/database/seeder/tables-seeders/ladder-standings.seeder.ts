import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ladder, LadderStanding, Team } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class LadderStandingSeeder {
    constructor(
        @InjectRepository(LadderStanding)
        private readonly ladderStandingRepository: Repository<LadderStanding>,
    ) {}

    async seed(numberOfRows: number, teams: Team[], ladders: Ladder[]) {
        const isSeeded = await this.ladderStandingRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"LadderStanding" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "LadderStanding" table...`);
        const createdLadderStandings = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const ladderStanding: Partial<LadderStanding> = {
                //stage: faker.lorem.word(1),
                //team: teams[i],
                ladder: ladders[i],
            };
            const newLadderStanding = await this.ladderStandingRepository.create(ladderStanding);
            createdLadderStandings.push(newLadderStanding);
            await this.ladderStandingRepository.save(newLadderStanding);
        }
        return createdLadderStandings;
    }
}
