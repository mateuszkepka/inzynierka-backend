import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Expose } from 'class-transformer';

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
}
