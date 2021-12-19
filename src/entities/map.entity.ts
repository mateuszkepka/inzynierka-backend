import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Match } from './match.entity';
import { Performance } from './performance.entity';

@Entity()
export class Map {
    @Expose()
    @PrimaryGeneratedColumn()
    mapId: number;

    @Expose()
    @Column()
    mapResult: string;

    @Expose()
    @OneToMany(() => Performance, (performance) => performance.map)
    performances: Performance[];

    @Expose()
    @ManyToOne(() => Match, (match) => match.maps)
    @JoinColumn({ name: `matchId` })
    match: Match;
}
