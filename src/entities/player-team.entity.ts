import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from './team.entity';
import { Player } from './player.entity';
import { Expose } from 'class-transformer';

@Entity()
export class PlayerTeam {
    @PrimaryGeneratedColumn()
    @Expose()
    playerTeamId: number;

    @Expose()
    @ManyToOne(() => Team, (team) => team.playerTeams)
    @JoinColumn({ name: `teamId` })
    team: Team;

    @Expose()
    @ManyToOne(() => Player, (player) => player.playerTeams)
    @JoinColumn({ name: `playerId` })
    player: Player;

    @Expose()
    @Column()
    isAccepted: boolean;
}
