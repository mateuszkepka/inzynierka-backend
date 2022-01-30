import { Expose } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

    @OneToMany(() => Tournament, (tournament) => tournament.prize)
    tournament: Tournament;
}
