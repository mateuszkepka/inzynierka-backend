import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose, Transform } from 'class-transformer';
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
    @Expose()
    @PrimaryGeneratedColumn()
    tournamentId: number;

    @Expose()
    @Column({ nullable: true })
    name: string;

    @Expose()
    @Column()
    numberOfPlayers: number;

    @Expose()
    @Column()
    numberOfTeams: number;

    @Expose()
    @Column()
    registerStartDate: Date;

    @Expose()
    @Column({ nullable: true })
    registerEndDate: Date;

    @Expose()
    @Column()
    tournamentStartDate: Date;

    @Expose()
    @Column({ nullable: true })
    tournamentEndDate: Date;

    @Expose()
    @Column()
    description: string;

    @Expose()
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.gameId;
        } else {
            return
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Game)
    @JoinColumn({ name: `gameId` })
    game: Game;

    @Expose()
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.userId;
        } else {
            return
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => User, (user) => user.organizedTournaments, { onDelete: `NO ACTION` })
    @JoinColumn({ name: `organizerId` })
    organizer: User;

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

    @OneToMany(() => ParticipatingTeam, (roster) => roster.tournament)
    rosters: ParticipatingTeam[];

    @Expose()
    @OneToOne(() => Prize, (prize) => prize.tournament, { cascade: true, eager: true })
    @JoinColumn({ name: `prizeId` })
    prize: Prize;
}
