import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    gameId: number;

    @Column()
    name: string;

    @Column()
    genre: string;
}
