import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString } from 'class-validator';
import { ParticipationStatus } from 'src/modules/teams/participation-status';
import { RosterMember } from 'src/modules/tournaments/dto/create-participating-team.dto';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Team, Tournament } from '.';

@Entity()
export class ParticipatingTeam {
    @Expose()
    @PrimaryGeneratedColumn()
    participatingTeamId: number;

    @Expose({ name: `tournamentId` })
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.tournamentId;
        } else {
            return
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Tournament)
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @Expose()
    @ManyToOne(() => Team)
    @JoinColumn({ name: `teamId` })
    team: Team;

    @Expose()
    @Column()
    signDate: Date;

    @Expose()
    @Column({ default: null, nullable: true })
    verificationDate: Date;

    @Expose()
    @Column({ default: null, nullable: true })
    checkInDate: Date;

    @Expose()
    @Column({
        type: `enum`,
        enum: ParticipationStatus,
        default: ParticipationStatus.Signed
    })
    status: ParticipationStatus;

    @Expose()
    @Column({ type: `json`, nullable: true })
    @Type(() => RosterMember)
    roster: RosterMember[];

    @Expose()
    @Column({ type: `json`, nullable: true })
    @Type(() => RosterMember)
    subs: RosterMember[];
}