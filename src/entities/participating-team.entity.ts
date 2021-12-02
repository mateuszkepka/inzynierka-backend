import { Expose } from 'class-transformer';
import { IsBoolean, IsDateString } from 'class-validator';
import { Roster } from 'src/modules/teams/interfaces/roster';
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
    @IsDateString()
    signDate: Date;

    @Column()
    @IsBoolean()
    isApproved: boolean;

    @Column({ nullable: true })
    @IsDateString()
    approvalDate: Date;

    @Column({ type: `json` })
    roster: Roster;
}
