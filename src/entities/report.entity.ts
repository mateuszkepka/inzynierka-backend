import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Expose } from 'class-transformer';
import { ReportStatus } from 'src/modules/reports/report-status.enum';
import { User } from '.';

@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    @Expose()
    reportId: number;

    @Expose()
    @Column({
        type: `enum`,
        enum: ReportStatus,
        default: ReportStatus.Unseen,
    })
    status: ReportStatus;

    @Expose()
    @Column()
    reportDate: Date;

    @Expose()
    @Column()
    description: string;

    @Expose()
    @Column({ nullable: true })
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
