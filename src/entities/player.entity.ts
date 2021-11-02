import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Game } from '.';
import { Performance } from './performance.entity';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity()
export class Player {
    @PrimaryGeneratedColumn()
    playerId: number;

    @Column()
    PUUID: string;

    @Column()
    accountId: string;

    @Column()
    summonerId: string;

    @Column()
    region: string;

    @ManyToOne(() => User, (user) => user.accounts)
    @JoinColumn({ name: "userId" })
    user: User;

    @OneToMany(() => Performance, (performance) => performance.player)
    performances: Performance[];

    @OneToMany(() => Team, (team) => team.captain)
    ownedTeams: Team[];

    @OneToOne(() => Game)
    @JoinColumn({ name: "gameId" })
    game: Game;

    @ManyToMany(() => Team)
    playerTeams: Team[];
}
