import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as faker from 'faker';
import { Invitation, Player, Team } from 'src/database/entities';
import { InvitationStatus } from 'src/modules/invitations/interfaces/invitation-status.enum';
import { shuffle } from 'src/utils/tournaments-util';
import { Connection, Repository } from 'typeorm';

@Injectable()
export class TeamsSeeder {
    constructor(
        @InjectRepository(Invitation) private readonly invitationRepository: Repository<Invitation>,
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        private readonly connection: Connection,
    ) { }

    async seed(captains: Player[]) {
        const createdTeams = [];
        await this.connection.transaction(async (manager) => {
            captains = shuffle(captains);
            for (let i = 0; i < captains.length; ++i) {
                const ifCaptain = Math.random() < 0.3 ? true : false;
                if (ifCaptain) {
                    const team = this.teamsRepository.create({
                        teamName: `${faker.internet.userName()}${faker.random.word()}`,
                        captain: captains[i],
                        game: captains[i].game,
                        region: captains[i].region,
                    });
                    createdTeams.push(team);
                    await manager.save(team);
                    const invitation = this.invitationRepository.create({
                        team: team,
                        player: captains[i],
                        status: InvitationStatus.Accepted
                    });
                    await manager.save(invitation);
                }
            }
        });
        return createdTeams;
    }
}
