import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Team } from './team.entity';
import { Player } from './player.entity';
import { Expose, Transform } from 'class-transformer';
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

    @Expose({ name: `playerId` })
    @ManyToOne(() => Player, (player) => player.teams, { nullable: true })
    @JoinColumn({ name: `playerId` })
    player: Player;

    @Expose({ name: `teamId` })
    @Transform(
        ({ value }) => {
            if (value === undefined) {
                return;
            }
            return value.teamId;
        },
        { toPlainOnly: true },
    )
    @ManyToOne(() => Team, (team) => team.members, { nullable: true, onDelete: `CASCADE` })
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
