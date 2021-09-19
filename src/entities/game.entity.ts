import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Tournament } from "./tournament.entity";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    gameId: number;

    @Column()
    name: string;

    @Column()
    genre: string;

    @ManyToOne(() => Tournament, (tournament) => tournament.games)
    tournament: Tournament;
}