import { Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
