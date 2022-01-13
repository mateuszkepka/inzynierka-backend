import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, Team } from 'src/entities';
import { Invitation } from 'src/entities/invitation.entity';
import { InvitationStatus } from 'src/modules/invitations/interfaces/invitation-status.enum';
import { getRandom, shuffle } from 'src/utils/tournaments-util';
import { Repository } from 'typeorm';

@Injectable()
export class InvitationsSeeder {
    constructor(
        @InjectRepository(Invitation) private readonly invitationsRepository: Repository<Invitation>,
    ) { }

    async seed(players: Player[], teams: Team[]) {
        const createdInvitations = [];
        let numberOfSeeded = 0;
        players = shuffle(players);
        for (let i = 0; i < teams.length; i++) {
            const captain = teams[i].captain;
            const team = teams.find((team) => team.captain === captain);
            const index = teams.indexOf(team);
            teams.splice(index, 1)
            const numberOfPlayers = getRandom([0.2, 0.15, 0.15, 0.05, 0.05, 0.4], [0, 1, 2, 3, 4, 5]);
            if (numberOfPlayers === 0) {
                continue;
            }
            for (let j = numberOfSeeded; j < numberOfSeeded + numberOfPlayers; j++) {
                if (players[j]) {
                    const invitation = this.invitationsRepository.create({
                        player: players[j],
                        team: teams[i],
                        status: InvitationStatus.Accepted
                    });
                    createdInvitations.push(invitation);
                }
            }
            numberOfSeeded += numberOfPlayers;
        }
        return this.invitationsRepository.save(createdInvitations);
    }
}
