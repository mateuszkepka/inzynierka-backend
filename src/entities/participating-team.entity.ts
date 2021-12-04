import { Expose } from 'class-transformer';
import { IsBoolean, IsDateString } from 'class-validator';
import { Roster } from 'src/modules/teams/teams.interface';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Team, Tournament } from '.';

@Entity()
export class ParticipatingTeam {
    @PrimaryGeneratedColumn()
    @Expose()
    participatingTeamId: number;

    @ManyToOne(() => Tournament)
    @JoinColumn({ name: `tournamentId` })
    @Expose()
    tournament: Tournament;

    @ManyToOne(() => Team)
    @JoinColumn({ name: `teamId` })
    @Expose()
    team: Team;

    @Column()
    @Expose()
    @IsDateString()
    signDate: Date;

    @Column()
    @Expose()
    @IsBoolean()
    isApproved: boolean;

    @Expose()
    @Column()
    @IsDateString()
    approvalDate: Date;

    @Column({ type: `json` })
    roster: Roster;
}
