import { Expose, Transform } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LadderStanding } from '.';
import { Tournament } from './tournament.entity';

@Entity()
export class Ladder {
    @Expose()
    @PrimaryGeneratedColumn()
    ladderId: number;

    @Expose()
    @Column()
    isLosers: boolean;

    @Expose()
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.tournamentId;
        } else {
            return
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Tournament, (tournament) => tournament.groups, { onDelete: `CASCADE` })
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @Expose()
    @OneToMany(() => LadderStanding, (standing) => standing.ladder)
    standings: LadderStanding[]
}
