import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    gameId: number;

    @Column()
    name: string;

    @Column()
    genre: string;
}
