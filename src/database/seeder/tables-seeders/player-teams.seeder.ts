import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, Team } from 'src/entities';
import { PlayerTeam } from 'src/entities/player-team.entity';
import { InvitationStatus } from 'src/modules/teams/teams.interface';
import { Repository } from 'typeorm';

@Injectable()
export class PlayerTeamSeeder {
    constructor(
        @InjectRepository(PlayerTeam) private readonly playerTeamRepository: Repository<PlayerTeam>,
    ) {}

    async seed(numberOfRows: number, players: Player[], teams: Team[]) {
        const isSeeded = await this.playerTeamRepository.findOne();

        if (isSeeded) {
            console.log(`"PlayerTeam" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "PlayerTeam" table...`);
        const createdPlayerTeams = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const playerTeam: Partial<PlayerTeam> = {
                player: players[i],
                team: teams[i],
            };
            const newPlayerTeams = await this.playerTeamRepository.create(playerTeam);
            createdPlayerTeams.push(newPlayerTeams);
            await this.playerTeamRepository.save(newPlayerTeams);
        }
        return createdPlayerTeams;
    }
}
