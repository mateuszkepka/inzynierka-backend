import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Ladder } from './ladder.entity';
import { Team } from './team.entity';

@Entity()
export class LadderStanding {
    @PrimaryGeneratedColumn()
    ladderStandingId: number;

    @Column()
    stage: string;

    @ManyToOne(() => Ladder, (ladder) => ladder.ladderStandings)
    @JoinColumn({ name: `ladderId` })
    ladder: Ladder;

    @ManyToOne(() => Team)
    @JoinColumn({ name: `teamId` })
    team: Team;
}
