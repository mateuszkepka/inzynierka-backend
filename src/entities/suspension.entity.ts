import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Suspension {
    @PrimaryGeneratedColumn()
    suspensionId: number;

    @Column()
    suspensionStartDate: Date;

    @Column()
    suspensionEndDate: Date;

    @Column()
    reason: string;

    @ManyToOne(() => User, (user) => user.suspensions)
    user: User;
}
