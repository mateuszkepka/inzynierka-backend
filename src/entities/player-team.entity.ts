import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Team } from './team.entity';
import { Player } from './player.entity';
import { Expose } from 'class-transformer';

@Entity()
export class PlayerTeam {
    @Expose()
    @ManyToOne(() => Team, (team) => team.playerTeams, { primary: true })
    @JoinColumn({ name: `teamId` })
    team: Team;

    @Expose()
    @ManyToOne(() => Player, (player) => player.playerTeams, { primary: true })
    @JoinColumn({ name: `playerId` })
    player: Player;

    @Expose()
    @Column()
    isAccepted: boolean;
}
