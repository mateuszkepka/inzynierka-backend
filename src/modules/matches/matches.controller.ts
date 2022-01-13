import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesService } from './matches.service';

@Controller(`matches`)
@Roles(Role.Player)
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) { }

    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return this.matchesService.getById(id);
    }

    @Post(`/:id/results/:winnerId`)
    @UseInterceptors(FilesInterceptor(`results`))
    async sendResults(@Param(`id`, ParseIntPipe) id: number, @Param(`winnerId`, ParseIntPipe) winnerId: number, @UploadedFiles() results: Array<Express.Multer.File>) {
        return this.matchesService.resolveMatch(id, winnerId, results);
    }

    @Patch(`/:id`)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateMatchDto) {
        return this.matchesService.update(id, body);
    }
}
