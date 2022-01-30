import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UsePipes } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
import { DateValidationPipe } from 'src/pipes/date-validation.pipe';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { SuspensionStatus } from './dto/suspension-status.enum';
import { UpdateSuspensionDto } from './dto/update-suspension.dto';
import { SuspensionsService } from './suspensions.service';

@Controller(`suspensions`)
@Roles(Role.Admin)
export class SuspensionsController {
    constructor(private readonly suspensionsService: SuspensionsService) { }

    @Get(`/:suspensionId`)
    async getById(@Param(`suspensionId`, ParseIntPipe) suspensionId: number) {
        return await this.suspensionsService.getById(suspensionId);
    }

    @Get()
    async getFiltered(@Query(`userId`) userId: number, @Query(`status`) status: SuspensionStatus) {
        return await this.suspensionsService.getFiltered(userId, status);
    }

    @Post()
    @UsePipes(DateValidationPipe)
    async create(@Body() body: CreateSuspensionDto, @Req() { user }: RequestWithUser) {
        return await this.suspensionsService.create(body, user);
    }

    @Patch(`/:suspensionId`)
    @UsePipes(DateValidationPipe)
    async update(@Param(`suspensionId`, ParseIntPipe) suspensionId: number, @Body() body: UpdateSuspensionDto) {
        return await this.suspensionsService.update(suspensionId, body);
    }

    @Delete(`/:suspensionId`)
    async remove(@Param(`suspensionId`, ParseIntPipe) suspensionId: number) {
        return await this.suspensionsService.remove(suspensionId);
    }
}
