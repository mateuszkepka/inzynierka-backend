import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Prize {
    @PrimaryGeneratedColumn()
    prizeId: number;

    @Column()
    currency: string;

    @Column()
    distribution: string;
}
