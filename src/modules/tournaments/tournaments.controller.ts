import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Put,
    SerializeOptions,
    UseGuards,
} from '@nestjs/common';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';
@Controller(`tournaments`)
@SerializeOptions({
    strategy: `excludeAll`,
})
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) {}

    @Get(`/:id`)
    @UseGuards(JwtAuthGuard)
    async findById(@Param(`id`) id: string) {
        const torunament = await this.tournamentsService.getById(Number(id));

        if (!torunament) {
            throw new NotFoundException(`Tournament not found`);
        }

        return torunament;
    }

    @Delete(`/:id`)
    removeTournament(@Param(`id`) id: string) {
        return this.tournamentsService.remove(Number(id));
    }

    @Put(`/:id`)
    updateTournament(@Param(`id`) id: string, @Body() body: UpdateTournamentDto) {
        return this.tournamentsService.update(Number(id), body);
    }
}