import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Team } from './team.entity';
import { Player } from './player.entity';
import { Expose } from 'class-transformer';
import {
    InvitationStatus,
    Status,
} from 'src/modules/invitations/interfaces/invitation-status.enum';

@Entity()
@Unique([`player`, `team`])
export class Invitation {
    @Expose()
    @PrimaryGeneratedColumn()
    invitationId: number;

    @Expose()
    @ManyToOne(() => Player, (player) => player.teams)
    @JoinColumn({ name: `playerId` })
    player: Player;

    @Expose()
    @ManyToOne(() => Team, (team) => team.members, { onDelete: `CASCADE` })
    @JoinColumn({ name: `teamId` })
    team: Team;

    @Expose()
    @Column({
        type: `enum`,
        enum: InvitationStatus,
        default: InvitationStatus.Pending,
    })
    status: Status;
}
