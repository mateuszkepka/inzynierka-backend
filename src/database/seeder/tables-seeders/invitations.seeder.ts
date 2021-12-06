import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, Team } from 'src/entities';
import { Invitation } from 'src/entities/invitation.entity';
import { InvitationStatus } from 'src/modules/teams/interfaces/teams.interface';
import { Repository } from 'typeorm';

@Injectable()
export class InvitationsSeeder {
    constructor(
        @InjectRepository(Invitation) private readonly invitationsRepository: Repository<Invitation>,
    ) {}

    async seed(numberOfRows: number, players: Player[], teams: Team[]) {
        const isSeeded = await this.invitationsRepository.findOne();

        if (isSeeded) {
            console.log(`"Invitation" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Invitation" table...`);
        const createdInvitations = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const invitation: Partial<Invitation> = {
                player: players[i],
                team: teams[i],
                status: InvitationStatus.Accepted
            };
            const newInvitations = await this.invitationsRepository.create(invitation);
            createdInvitations.push(newInvitations);
            await this.invitationsRepository.save(newInvitations);
        }
        return createdInvitations;
    }
}
