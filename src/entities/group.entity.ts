import { Expose, Transform, Type } from 'class-transformer';
import { StandingsDto } from 'src/modules/tournaments/dto/standings-dto';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tournament } from './tournament.entity';

@Entity()
export class Group {
    @Expose()
    @PrimaryGeneratedColumn()
    groupId: number;

    @Expose()
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.tournamentId;
        } else {
            return
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Tournament, (tournament) => tournament.groups)
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @Expose()
    @Column({ type: `json`, nullable: true })
    @Type(() => StandingsDto)
    standings: StandingsDto[]
}
