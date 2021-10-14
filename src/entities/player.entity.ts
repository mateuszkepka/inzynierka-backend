import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { ActiveRoster } from './active-roster.entity';
import { Game } from '.';
import { Performance } from './performance.entity';
import { Team } from './team.entity';
import { User } from '../modules/users/user.entity';

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
    user: User;

    @OneToMany(() => ActiveRoster, (activeRoster) => activeRoster.player)
    activeRosters: ActiveRoster[];

    @OneToMany(() => Performance, (performance) => performance.player)
    performances: Performance[];

    @OneToMany(() => Team, (team) => team.captain)
    ownedTeams: Team[];

    @ManyToMany(() => Game)
    @JoinTable()
    games: Game[];

    @ManyToMany(() => Team)
    @JoinTable()
    teams: Team[];
}
