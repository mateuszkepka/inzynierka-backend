import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Expose } from 'class-transformer';
import { User } from './user.entity';
import { ValidateIf } from 'class-validator';

@Entity()
export class Suspension {
    @PrimaryGeneratedColumn()
    suspensionId: number;

    @Column()
    @Expose()
    suspensionStartDate: Date;

    @Column()
    @Expose()
    @ValidateIf((suspension) => suspension.suspensionStartDate > suspension.suspensionEndDate)
    suspensionEndDate: Date;

    @Column()
    @Expose()
    reason: string;

    @ManyToOne(() => User, (user) => user.suspensions)
    @JoinColumn({ name: `userId` })
    user: User;
}
