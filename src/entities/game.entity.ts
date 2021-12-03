import { Expose } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from '.';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    gameId: number;

    @Expose()
    @Column()
    title: string;
    
    @Expose()
    @Column()
    genre: string;
}
