import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { CreateMatchDto } from './dto/create-match.dto';
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

    @Post(`/:id/results`)
    @UseInterceptors(FilesInterceptor(`results`))
    async sendResults(@Param(`id`, ParseIntPipe) id: number, @UploadedFiles() results: Array<Express.Multer.File>) {
        return this.matchesService.resolveMatch(id, results);
    }

    // @Post()
    // @Roles(Role.Organizer)
    // async create(@Body() matchData: CreateMatchDto) {
    //     return this.matchesService.create(matchData);
    // }

    @Patch(`/:id`)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateMatchDto) {
        return this.matchesService.update(id, body);
    }
}
