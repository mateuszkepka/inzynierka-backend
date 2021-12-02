import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    SerializeOptions,
    UseGuards,
} from '@nestjs/common';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { UpdateSuspensionDto } from './dto/update-suspension.dto';
import { SuspensionsService } from './suspensions.service';

@Controller(`suspensions`)
@SerializeOptions({
    strategy: `excludeAll`,
})
export class SuspensionsController {
    constructor(private readonly suspensionsService: SuspensionsService) {}

    @Post(`/:id`)
    suspend(@Body() body: CreateSuspensionDto) {
        const { player } = body;
        if (!player) {
            throw new BadRequestException(`Such player doesn't exist`);
        }
        return this.suspensionsService.suspend(body);
    }

    @UseGuards(JwtAuthGuard)
    @Get(`/usersSuspensions`)
    async findByUser(@Req() request: RequestWithUser) {
        const { user } = request;
        if (!user) {
            throw new BadRequestException(`Such player doesn't exist`);
        }

        return await this.suspensionsService.getByUser(user);
    }

    @Get(`/:id`)
    async findById(@Param(`id`) id: string) {
        const suspension = await this.suspensionsService.getById(Number(id));
        if (!suspension) {
            throw new NotFoundException(`Suspension not found`);
        }
        return suspension;
    }

    @Delete(`/:id`)
    removeSuspension(@Param() id: string) {
        return this.suspensionsService.remove(Number(id));
    }

    @Put(`/:id`)
    updateSuspension(@Param(`id`) id: string, @Body() body: UpdateSuspensionDto) {
        return this.suspensionsService.update(Number(id), body);
    }
}
