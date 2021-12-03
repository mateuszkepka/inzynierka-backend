import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Game, PlayerTeam } from '.';

import { Expose } from 'class-transformer';
import { Performance } from './performance.entity';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity()
export class Player {
    @Expose()
    @PrimaryGeneratedColumn()
    playerId: number;

    @Expose()
    @Column()
    summonerName: string;

    @Column({ nullable: true })
    PUUID: string;

    @Column({ nullable: true })
    accountId: string;

    @Column({ nullable: true })
    summonerId: string;

    @Expose()
    @Column()
    region: string;

    @ManyToOne(() => User, (user) => user.accounts)
    @JoinColumn({ name: `userId` })
    @Expose()
    user: User;

    @OneToMany(() => Performance, (performance) => performance.player)
    performances: Performance[];

    @OneToMany(() => Team, (team) => team.captain)
    @Expose()
    ownedTeams: Team[];

    @Expose()
    @ManyToOne(() => Game)
    @JoinColumn({ name: `gameId` })
    game: Game;

    @OneToMany(() => PlayerTeam, (playerTeam) => playerTeam.team)
    playerTeams: PlayerTeam[];
}
