import { Expose } from 'class-transformer';
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Game } from './game.entity';
import { Group } from './group.entity';
import { Ladder } from './ladder.entity';
import { Match } from './match.entity';
import { Preset } from './preset.entity';
import { Prize } from './prize.entity';
import { TournamentAdmin } from './tournament-admin.entity';
import { User } from './user.entity';

@Entity()
export class Tournament {
    @PrimaryGeneratedColumn()
    tournamentId: number;

    @Column()
    @Expose()
    name: string;

    @Column()
    @Expose()
    numberOfPlayers: number;

    @Column()
    @Expose()
    numberOfTeams: number;

    @Column()
    @Expose()
    registerStartDate: Date;

    @Column()
    @Expose()
    registerEndDate: Date;

    @Column()
    @Expose()
    tournamentStartDate: Date;

    @Column()
    @Expose()
    tournamentEndDate: Date;

    @Column()
    @Expose()
    description: string;

    @OneToOne(() => Prize, (prize) => prize.tournament)
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
    @Expose()
    organizer: User;
}
