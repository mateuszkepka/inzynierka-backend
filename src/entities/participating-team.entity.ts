import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString } from 'class-validator';
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
    @IsDateString()
    signDate: Date;

    @Expose()
    @Column({ type: `bool`, default: false })
    @IsBoolean()
    isApproved: boolean;

    @Expose()
    @Column({ default: null, nullable: true })
    @IsDateString()
    decisionDate: Date;

    @Expose()
    @Column({ type: `json`, nullable: true })
    @Type(() => RosterMember)
    roster: RosterMember[];

    @Expose()
    @Column({ type: `json`, nullable: true })
    @Type(() => RosterMember)
    subs: RosterMember[];
}