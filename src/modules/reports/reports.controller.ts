import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { CreateReportDto } from './dto/create-report-dto';
import { ReportStatusQuery } from './dto/get-reports.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

@Controller(`reports`)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get(`/:id`)
    @Roles(Role.Admin)
    async get(@Param(`id`, ParseIntPipe) id: number) {
        return this.reportsService.getById(id);
    }

    @Get()
    @Roles(Role.Admin)
    async getFiltered(@Query() query: ReportStatusQuery) {
        return this.reportsService.getFiltered(query);
    }

    @Post()
    @Roles(Role.Player)
    async create(@Body() reportDate: CreateReportDto, @Req() { user }: RequestWithUser) {
        return this.reportsService.create(reportDate, user);
    }

    @Patch(`/:id`)
    @Roles(Role.Admin)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateReportDto) {
        return this.reportsService.update(id, body);
    }
}
