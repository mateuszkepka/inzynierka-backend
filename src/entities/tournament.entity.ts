import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
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
import { ParticipatingTeam } from '.';

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

    @OneToOne(() => Prize)
    @JoinColumn({ name: `prizeId` })
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

    @ManyToMany(() => User)
    tournamentAdmins: User[];

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
