import { Expose } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player, Team } from '.';

@Entity()
export class Game {
    @Expose()
    @PrimaryGeneratedColumn()
    gameId: number;

    @Expose()
    @Column()
    title: string;

    @Expose()
    @Column()
    genre: string;
}
