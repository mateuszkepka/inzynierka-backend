import { Expose } from 'class-transformer';
import { ReportStatus } from 'src/modules/reports/report-status.enum';
import { adjustTimeZone } from 'src/utils/date-util';
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
    @Column({
        transformer: {
            to(value) {
                return adjustTimeZone(value.valueOf());
            },
            from(value) {
                return adjustTimeZone(value.valueOf(), true);
            }
        }
    })
    reportDate: Date;

    @Expose()
    @Column()
    description: string;

    @Expose()
    @Column({
        transformer: {
            to(value) {
                return adjustTimeZone(value.valueOf());
            },
            from(value) {
                return adjustTimeZone(value.valueOf(), true);
            }
        },
        nullable: true
    })
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
