import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
import { editMapName, imageFileFilter } from 'src/utils/uploads-util';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesService } from './matches.service';

@Controller(`matches`)
@Roles(Role.Player)
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get(`/:id`)
    @Public()
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return this.matchesService.getById(id);
    }

    @Post(`/:matchId/results/:winnerId`)
    async testResults(
        @UploadedFiles() results: Array<Express.Multer.File>,
        @Param(`matchId`, ParseIntPipe) matchId: number,
        @Req() { user }: RequestWithUser
    ) {
        return this.matchesService.parseResults(matchId, results, user);
    }

    @Post(`/:matchId/results/`)
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
        return this.matchesService.resolveMatch(matchId, results, user);
    }

    @Patch(`/:id`)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateMatchDto) {
        return this.matchesService.update(id, body);
    }
}
