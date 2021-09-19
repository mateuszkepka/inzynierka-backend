import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Match } from "./match.entity";
import { Performance } from "./performance.entity";

@Entity()
export class Map {
    @PrimaryGeneratedColumn()
    mapId: number

    @Column()
    mapResult: string;

    @OneToMany(() => Performance, (performance) => performance.map)
    performances: Performance[];

    @ManyToOne(() => Match, (match) => match.maps)
    match: Match;
}