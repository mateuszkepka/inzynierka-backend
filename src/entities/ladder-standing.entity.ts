import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ladder } from './ladder.entity';
import { Match } from './match.entity';

@Entity()
export class LadderStanding {
    @Expose()
    @PrimaryGeneratedColumn()
    ladderStandingId: number;

    @Expose()
    @Column()
    round: number;

    @Expose()
    @Column()
    position: number;

    @Expose()
    @ManyToOne(() => Ladder, (ladder) => ladder.standings)
    @JoinColumn({ name: `ladderId` })
    ladder: Ladder;

    @Expose()
    @ManyToOne(() => Match, (match) => match.standings)
    @JoinColumn({ name: `matchId` })
    match: Match;
}
