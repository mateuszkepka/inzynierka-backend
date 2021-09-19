import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Map } from "./map.entity";
import { Player } from "./player.entity";

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
    player: Player;

    @ManyToOne(() => Map, (map) => map.performances)
    map: Map;
}