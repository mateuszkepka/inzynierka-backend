import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Map } from './map.entity';
import { Player } from './player.entity';

@Entity()
export class Performance {
    @PrimaryGeneratedColumn()
    performanceId: number;

    @Column()
    kills: number;

    @Column()
    deaths: number;

    @Column()
    assists: number;

    @ManyToOne(() => Player, (player) => player.performances)
    @JoinColumn({ name: "playerId" })
    player: Player;

    @ManyToOne(() => Map, (map) => map.performances)
    map: Map;
}
