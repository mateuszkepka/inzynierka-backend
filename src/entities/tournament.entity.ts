import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Expose } from 'class-transformer';
import { Game } from './game.entity';
import { Group } from './group.entity';
import { Ladder } from './ladder.entity';
import { Match } from './match.entity';
import { Preset } from './preset.entity';
import { Prize } from './prize.entity';
import { User } from './user.entity';
import { ParticipatingTeam, TournamentAdmin } from '.';

@Entity()
export class Tournament {
    @PrimaryGeneratedColumn()
    @Expose()
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

    @OneToOne(() => Prize, (prize) => prize.tournament, {
        eager: true,
        onDelete: `CASCADE`,
    })
    @JoinColumn({ name: `prizeId` })
    @Expose()
    prize: Prize;

    @ManyToOne(() => Game)
    @JoinColumn({ name: `gameId` })
    game: Game;

    @OneToMany(() => Group, (group) => group.tournament)
    groups: Group[];

    @OneToMany(() => Ladder, (ladder) => ladder.tournament)
    ladders: Ladder[];

    @OneToMany(() => Match, (match) => match.tournament)
    matches: Match[];

    @OneToMany(() => TournamentAdmin, (tournamentAdmin) => tournamentAdmin.tournament)
    tournamentAdmins: TournamentAdmin[];

    @OneToOne(() => Preset)
    @JoinColumn({ name: `presetId` })
    preset: Preset;

    @ManyToOne(() => User, (user) => user.organizedTournaments)
    @JoinColumn({ name: `organizerId` })
    @Expose()
    organizer: User;

    @OneToMany(() => ParticipatingTeam, (roster) => roster.tournament)
    rosters: ParticipatingTeam[];
}
