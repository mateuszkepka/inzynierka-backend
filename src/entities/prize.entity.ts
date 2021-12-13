import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Expose } from 'class-transformer';
import { Tournament } from '.';

@Entity()
export class Prize {
    @PrimaryGeneratedColumn()
    @Expose()
    prizeId: number;

    @Column()
    @Expose()
    currency: string;

    @Column()
    @Expose()
    distribution: string;

    @OneToOne(() => Tournament, (tournament) => tournament.prize)
    tournament: Tournament;
}
