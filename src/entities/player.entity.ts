import { Expose } from 'class-transformer';
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
    PUUID: string;

    @Expose()
    @Column()
    accountId: string;

    @Expose()
    @Column()
    summonerId: string;

    @Expose()
    @Column()
    region: string;

    @ManyToOne(() => User, (user) => user.accounts)
    @JoinColumn({ name: `userId` })
    user: User;

    @OneToMany(() => Performance, (performance) => performance.player)
    performances: Performance[];

    @OneToMany(() => Team, (team) => team.captain)
    ownedTeams: Team[];

    @OneToOne(() => Game)
    @JoinColumn({ name: `gameId` })
    game: Game;

    @OneToMany(() => PlayerTeam, (playerTeam) => playerTeam.team)
    playerTeams: PlayerTeam[];
}
