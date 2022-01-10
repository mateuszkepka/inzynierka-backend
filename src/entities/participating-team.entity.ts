import { Expose, Transform, Type } from 'class-transformer';
import { ParticipationStatus } from 'src/modules/teams/dto/participation-status';
import { RosterMember } from 'src/modules/tournaments/dto/create-participating-team.dto';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GroupStanding, Team, Tournament } from '.';

@Entity()
export class ParticipatingTeam {
    @BeforeInsert()
    setDates() {
        this.signDate = new Date();
    }

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
    @ManyToOne(() => Tournament, { onDelete: `CASCADE` })
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
    @Column({ type: `json`, default: null, nullable: true })
    @Type(() => RosterMember)
    subs: RosterMember[];

    @Expose()
    @OneToMany(() => GroupStanding, (standing) => standing.roster)
    groups: GroupStanding[]
}