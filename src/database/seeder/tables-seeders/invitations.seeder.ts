import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, Team } from 'src/database/entities';
import { Invitation } from 'src/database/entities/invitation.entity';
import { InvitationStatus } from 'src/modules/invitations/interfaces/invitation-status.enum';
import { getRandom, shuffle } from 'src/utils/tournaments-util';
import { Repository } from 'typeorm';

@Injectable()
export class InvitationsSeeder {
    constructor(
        @InjectRepository(Invitation) private readonly invitationsRepository: Repository<Invitation>
    ) { }

    async seed(players: Player[], teams: Team[]) {
        const createdInvitations = [];
        let numberOfSeeded = 0;
        players = shuffle(players);
        for (const team of teams) {
            const index = players.indexOf(team.captain);
            players.splice(index, 1);
        }
        for (const team of teams) {
            const numberOfPlayers = getRandom(
                [0.2, 0.15, 0.15, 0.05, 0.05, 0.4],
                [0, 1, 2, 3, 4, 5],
            );
            if (numberOfPlayers === 0) {
                continue;
            }
            for (let j = numberOfSeeded; j < numberOfSeeded + numberOfPlayers; j++) {
                const ifExists = await this.invitationsRepository.findOne({ where: { team: team, player: players[j] } });
                if (players[j] && players[j].region === team.region && !ifExists) {
                    const invitation = this.invitationsRepository.create({
                        player: players[j],
                        team: team,
                        status: InvitationStatus.Accepted,
                    });
                    createdInvitations.push(invitation);
                }
            }
            numberOfSeeded += numberOfPlayers;
            numberOfSeeded += 1;
        }
        await this.invitationsRepository.save(createdInvitations);
    }
}
