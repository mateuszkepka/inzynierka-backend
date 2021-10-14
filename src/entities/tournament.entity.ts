import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Game } from './game.entity';
import { Group } from './group.entity';
import { Ladder } from './ladder.entity';
import { Match } from './match.entity';
import { Preset } from './preset.entity';
import { Prize } from './prize.entity';
import { TournamentAdmin } from './tournament-admin.entity';
import { User } from '../modules/users/user.entity';

@Entity()
export class Tournament {
    @PrimaryGeneratedColumn()
    tournamentId: number;

    @Column()
    name: string;

    @Column()
    numberOfPlayers: number;

    @Column()
    numberOfTeams: number;

    @Column()
    registerStartDate: Date;

    @Column()
    registerEndDate: Date;

    @Column()
    tournamentStartDate: Date;

    @Column()
    tournamentEndDate: Date;

    @Column()
    description: string;

    @OneToOne(() => Prize, (prize) => prize.tournament)
    @JoinColumn()
    prize: Prize;

    @OneToMany(() => Game, (game) => game.tournament)
    games: Game[];

    @OneToMany(() => Group, (group) => group.tournament)
    groups: Group[];

    @OneToMany(() => Ladder, (ladder) => ladder.tournament)
    ladders: Ladder[];

    @OneToMany(() => Match, (match) => match.tournament)
    matches: Match[];

    @OneToMany(() => TournamentAdmin, (tournamentAdmin) => tournamentAdmin.tournament)
    tournamentAdmins: TournamentAdmin[];

    @ManyToOne(() => Preset, (preset) => preset.tournaments)
    preset: Preset;

    @ManyToOne(() => User, (user) => user.organizedTournaments)
    organizer: User;
}
