import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, Team } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { shuffle } from 'src/util';

@Injectable()
export class TeamsSeeder {
    constructor(@InjectRepository(Team) private readonly teamsRepository: Repository<Team>) {}

    async seed(captains: Player[]) {
        const createdTeams = [];
        captains = shuffle(captains);
        for (let i = 0; i < captains.length; ++i) {
            const ifCaptain = Math.random() < 0.3 ? true : false;
            if (ifCaptain) {
                const team = this.teamsRepository.create({
                    teamName: faker.internet.userName(),
                    captain: captains[i],
                    game: captains[i].game,
                    region: captains[i].region,
                });
                createdTeams.push(team);
            }
        }
        return this.teamsRepository.save(createdTeams);
    }
}
