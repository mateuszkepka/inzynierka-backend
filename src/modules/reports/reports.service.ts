import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Report } from 'src/entities';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateReportDto } from './dto/create-report-dto';
import { ReportStatusQuery } from './dto/get-reports.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report) private readonly reportsRepository: Repository<Report>,
        private readonly usersService: UsersService,
    ) {}

    async getById(reportId: number) {
        const report = await this.reportsRepository.findOne({ where: { reportId: reportId } });
        if (!report) {
            throw new NotFoundException(`Report with given id does not exist`);
        }
        return report;
    }

    async getFiltered(query: ReportStatusQuery) {
        const { reportedId, reportingId, status } = query;
        const queryBuilder = this.reportsRepository
            .createQueryBuilder(`report`)
            .addSelect([`reported.userId`, `reported.username`])
            .addSelect([`reporting.userId`, `reporting.username`])
            .innerJoin(`report.reportedUser`, `reported`)
            .innerJoin(`report.reportingUser`, `reporting`)
            .where(`1=1`);
        if (reportedId) {
            queryBuilder.andWhere(`reported.userId = :reportedId`, { reportedId: reportedId });
        }
        if (reportingId) {
            queryBuilder.andWhere(`reporting.userId = :reportingId`, { reportingId: reportingId });
        }
        if (status) {
            queryBuilder.andWhere(`report.status = :status`, { status: status });
        }
        const reports = await queryBuilder.getMany();
        if (reports.length === 0) {
            throw new NotFoundException(`No reports with given parameters found`);
        }
        return reports;
    }

    async create(createReportDto: CreateReportDto, user: User) {
        console.log(user);
        const reportedUser = await this.usersService.getById(createReportDto.userId);
        if (reportedUser.userId === user.userId) {
            throw new BadRequestException(`You cant report Yourself`);
        }
        const report = new Report();
        report.reportingUser = user;
        report.reportedUser = reportedUser;
        report.description = createReportDto.description;
        report.reportDate = new Date();
        return this.reportsRepository.save(report);
    }

    async update(reportId: number, attrs: Partial<UpdateReportDto>) {
        const report = await this.getById(reportId);
        Object.assign(report, attrs);
        report.responseDate = new Date();
        return this.reportsRepository.save(report);
    }
}
