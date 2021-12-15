import { Expose } from 'class-transformer';
import { IsBoolean, IsDateString } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Team, Tournament } from '.';

@Entity()
export class ParticipatingTeam {
    @Expose()
    @PrimaryGeneratedColumn()
    participatingTeamId: number;

    @Expose()
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
    @Column(`bool`, { default: false })
    @IsBoolean()
    isApproved: boolean;

    @Expose()
    @Column({ default: null, nullable: true })
    @IsDateString()
    decisionDate: Date;

    @Expose()
    @Column({ type: `json` })
    roster: string[];

    @Expose()
    @Column({ type: `json`, nullable: true })
    subs: string[];
}
