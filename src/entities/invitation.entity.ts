import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from './team.entity';
import { Player } from './player.entity';
import { Expose } from 'class-transformer';
import { InvitationStatus, Statuses } from 'src/modules/teams/interfaces/teams.interface';

@Entity()
export class Invitation {
    @Expose()
    @PrimaryGeneratedColumn()
    invitationId: number;

    @Expose()
    @ManyToOne(() => Player, (player) => player.teams)
    @JoinColumn({ name: `playerId` })
    player: Player;

    @Expose()
    @ManyToOne(() => Team, (team) => team.members)
    @JoinColumn({ name: `teamId` })
    team: Team;

    @Expose()
    @Column({
        type: "enum",
        enum: InvitationStatus,
        default: InvitationStatus.Pending
    })
    status: Statuses;
}
