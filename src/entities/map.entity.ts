import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Match } from "./match.entity";

@Entity()
export class Map {
    @PrimaryGeneratedColumn()
    mapId: number

    @Column()
    mapResult: string;

    @ManyToOne(() => Match, (match) => match.maps)
    match: Match;
}