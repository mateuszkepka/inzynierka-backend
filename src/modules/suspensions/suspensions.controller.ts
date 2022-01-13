import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UsePipes,
} from '@nestjs/common';
import { DateValidationPipe } from 'src/pipes/date-validation.pipe';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { SuspensionStatus } from './dto/suspension-status.enum';
import { UpdateSuspensionDto } from './dto/update-suspension.dto';
import { SuspensionsService } from './suspensions.service';

@Controller(`suspensions`)
@Roles(Role.Admin)
export class SuspensionsController {
    constructor(private readonly suspensionsService: SuspensionsService) { }
    
    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return await this.suspensionsService.getById(id);
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

    @Patch(`/:id`)
    @UsePipes(DateValidationPipe)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateSuspensionDto) {
        return await this.suspensionsService.update(id, body);
    }

    @Delete(`/:id`)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return await this.suspensionsService.remove(id);
    }
}
