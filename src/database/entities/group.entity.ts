import { Expose, Transform } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Match } from '.';
import { GroupStanding } from './group-standing.entity';
import { Tournament } from './tournament.entity';

@Entity()
export class Group {
    @Expose()
    @PrimaryGeneratedColumn()
    groupId: number;

    @Expose()
    @Column()
    name: string;

    @Expose()
    @Transform(
        ({ value }) => {
            if (value !== undefined) {
                return value.tournamentId;
            } else {
                return;
            }
        },
        { toPlainOnly: true },
    )
    @ManyToOne(() => Tournament, (tournament) => tournament.groups, { onDelete: `CASCADE` })
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @Expose()
    @OneToMany(() => GroupStanding, (standing) => standing.group, { eager: true })
    standings: GroupStanding[];

    @OneToMany(() => Match, (match) => match.group)
    matches: Match[];
}
