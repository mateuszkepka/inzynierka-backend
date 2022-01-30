import { Expose, Transform } from 'class-transformer';
import { AdjustDate } from 'src/decorators/adjust-date.validator';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Suspension {
    @BeforeInsert()
    setDates() {
        this.startDate = new Date();
    }

    @Expose()
    @PrimaryGeneratedColumn()
    suspensionId: number;

    @Expose()
    @AdjustDate()
    startDate: Date;

    @Expose()
    @AdjustDate()
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
