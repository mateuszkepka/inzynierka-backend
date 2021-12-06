import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, Team } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class TeamsSeeder {
    constructor(
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
    ) {}

    async seed(numberOfRows: number, captains: Player[]) {
        const isSeeded = await this.teamsRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Team" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Team" table...`);
        const createdTeams = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const team: Partial<Team> = {
                name: faker.internet.userName(),
                creationDate: faker.datatype.datetime(),
                captain: captains[i]
            };
            const newTeam = await this.teamsRepository.create(team);
            createdTeams.push(newTeam);
            await this.teamsRepository.save(newTeam);
        }
        return createdTeams;
    }
}
