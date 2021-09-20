import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Tournament } from './tournament.entity';

@Entity()
export class Prize {
    @PrimaryGeneratedColumn()
    prizeId: number;

    @Column()
    currency: string;

    @Column()
    distribution: string;

    @OneToOne(() => Tournament, (tournament) => tournament.prize)
    tournament: Tournament;
}
