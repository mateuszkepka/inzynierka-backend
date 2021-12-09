import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Expose } from 'class-transformer';
import { User } from './user.entity';

@Entity()
export class Suspension {
    @BeforeInsert()
    setStartDate() {
        this.startDate = new Date()
    }

    @Expose()
    @PrimaryGeneratedColumn()
    suspensionId: number;

    @Expose()
    @Column()
    startDate: Date;

    @Expose()
    @Column()
    endDate: Date;

    @Expose()
    @Column()
    reason: string;

    @Expose()
    @ManyToOne(() => User, (user) => user.suspensions)
    @JoinColumn({ name: `userId` })
    user: User;

    @Expose()
    @ManyToOne(() => User)
    @JoinColumn({ name: `adminId` })
    admin: User;
}
