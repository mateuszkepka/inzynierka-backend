import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, Transform } from 'class-transformer';
import { User } from './user.entity';

@Entity()
export class Suspension {
    @BeforeInsert()
    setStartDate() {
        this.startDate = new Date();
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

    @Expose({ name: `userId` })
    @Transform(({ value }) => {
        if (value === undefined) {
            return;
        }
        return value.userId;
    }, { toPlainOnly: true })
    @ManyToOne(() => User, (user) => user.suspensions, { onDelete: `NO ACTION` })
    @JoinColumn({ name: `userId` })
    user: User;

    @Expose({ name: `adminId` })
    @Transform(({ value }) => {
        if (value === undefined) {
            return;
        }
        return value.userId;
    }, { toPlainOnly: true })
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: `adminId` })
    admin: User;
}
