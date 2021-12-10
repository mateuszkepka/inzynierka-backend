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
    SerializeOptions,
} from '@nestjs/common';
import { DateValidationPipe } from 'src/pipes/date-validation.pipe';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { UpdateSuspensionDto } from './dto/update-suspension.dto';
import { SuspensionsService } from './suspensions.service';

@Controller(`suspensions`)
@Roles(Role.Admin)
@SerializeOptions({ strategy: `excludeAll` })
export class SuspensionsController {
    constructor(private readonly suspensionsService: SuspensionsService) {}

    @Get()
    async getFiltered(@Query(`userId`) userId: number, @Query(`status`) status: string) {
        return await this.suspensionsService.getFiltered(userId, status);
    }

    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return await this.suspensionsService.getById(id);
    }

    @Post()
    async create(
        @Body(new DateValidationPipe()) body: CreateSuspensionDto,
        @Req() { user }: RequestWithUser,
    ) {
        return await this.suspensionsService.create(body, user);
    }

    @Patch(`/:id`)
    async update(
        @Param(`id`, ParseIntPipe) id: number,
        @Body(new DateValidationPipe()) body: UpdateSuspensionDto,
    ) {
        return await this.suspensionsService.update(id, body);
    }

    @Delete(`/:id`)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return await this.suspensionsService.remove(id);
    }
}
