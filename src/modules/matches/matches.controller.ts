import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
import { editMapName, imageFileFilter } from 'src/utils/uploads-util';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { UserIsTournamentAdmin } from '../tournaments/guards/user-is-tournament-admin.guard';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchResultsGuard } from './guards/match-results.guard';
import { MatchesService } from './matches.service';

@Controller(`matches`)
@Roles(Role.Player)
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) { }

    @Get(`/:matchId`)
    @Public()
    async getById(@Param(`matchId`, ParseIntPipe) matchId: number) {
        return this.matchesService.getById(matchId);
    }

    @Post(`/:matchId/results/`)
    @UseGuards(MatchResultsGuard)
    @UseInterceptors(
        FilesInterceptor(`image[]`, 5, {
            storage: diskStorage({
                destination: `./uploads/matches`,
                filename: editMapName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 4000000 },
        }),
    )
    async sendResults(
        @UploadedFiles() results: Array<Express.Multer.File>,
        @Param(`matchId`, ParseIntPipe) matchId: number,
        @Req() { user }: RequestWithUser
    ) {
        return this.matchesService.resolveAutomatically(matchId, results, user);
    }

    @Post(`/:matchId/resolve/:winner`)
    @UseGuards(UserIsTournamentAdmin)
    @Roles(Role.Admin, Role.Organizer)
    async resolveManually(
        @Param(`matchId`, ParseIntPipe) matchId: number,
        @Param(`winner`, ParseIntPipe) winner: number
    ) {
        return this.matchesService.resolveManually(matchId, winner);
    }

    @Patch(`/:matchId`)
    async update(@Param(`matchId`, ParseIntPipe) matchId: number, @Body() body: UpdateMatchDto) {
        return this.matchesService.update(matchId, body);
    }
}
