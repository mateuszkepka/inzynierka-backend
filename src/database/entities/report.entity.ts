import { Expose } from 'class-transformer';
import { AdjustDate } from 'src/decorators/adjust-date.validator';
import { ReportStatus } from 'src/modules/reports/report-status.enum';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '.';

@Entity()
export class Report {
    @BeforeInsert()
    setDates() {
        this.reportDate = new Date();
    }

    @Expose()
    @PrimaryGeneratedColumn()
    reportId: number;

    @Expose()
    @Column({
        type: `enum`,
        enum: ReportStatus,
        default: ReportStatus.Unseen,
    })
    status: ReportStatus;

    @Expose()
    @AdjustDate()
    reportDate: Date;

    @Expose()
    @Column()
    description: string;

    @Expose()
    @AdjustDate({ nullable: true, default: null })
    responseDate: Date;

    @Expose()
    @ManyToOne(() => User, (user) => user.reportsSent, { eager: true })
    @JoinColumn({ name: `reportingId` })
    reportingUser: User;

    @Expose()
    @ManyToOne(() => User, (user) => user.reportsReceived, { eager: true })
    @JoinColumn({ name: `reportedId` })
    reportedUser: User;
}
