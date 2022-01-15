import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/config/match-screens-upload.utils';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesService } from './matches.service';

@Controller(`matches`)
@Roles(Role.Player)
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return this.matchesService.getById(id);
    }

    @Get(`screenDetection/:path`)
    async textDetection(@Param(`path`) path: string) {
        return this.matchesService.textDetection(path);
    }

    // @Post(`/:id/results/:winnerId`)
    // @UseInterceptors(FilesInterceptor(`results`))
    // async sendResults(
    //     @Param(`id`, ParseIntPipe) id: number,
    //     @Param(`winnerId`, ParseIntPipe) winnerId: number,
    //     @UploadedFiles() results: Array<Express.Multer.File>,
    // ) {
    //     return this.matchesService.resolveMatch(id, winnerId, results);
    // }

    @Post(`/upload-player-screen/:id`)
    // @UseGuards(UploadTeamImagesGuard)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/matchScreens`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 2000000 },
        }),
    )
    async uploadedFile(
        @UploadedFile() image,
        @Param(`id`, ParseIntPipe) id: number,
        @Req() { user }: RequestWithUser,
    ) {
        if (!image) {
            throw new BadRequestException(
                `invalid file provided, allowed formats jpg/png/jpng and max size 4mb`,
            );
        }
        // return this.matchesService.setTeamProfile(id, image, user);
    }

    @Patch(`/:id`)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateMatchDto) {
        return this.matchesService.update(id, body);
    }
}
