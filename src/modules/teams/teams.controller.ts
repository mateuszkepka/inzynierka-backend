import {
    BadRequestException,
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
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { UpdateTeamDto } from './dto/update-team.dto';
import { MatchQuery } from '../matches/dto/get-matches.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from 'src/config/user-profile-upload.utils';
import { UploadTeamImagesGuard } from './guards/upload-team-images.guard';
import { UserIsCaptainGuard } from './guards/user-is-captain.guard';
import { Public } from 'src/roles/public.decorator';

@Controller(`teams`)
@Roles(Role.User)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

    @Get(`/:id/players/available`)
    async getAvailablePlayers(
        @Param(`id`, ParseIntPipe) id: number,
        @Req() { user }: RequestWithUser,
    ) {
        return this.teamsService.getAvailablePlayers(id, user);
    }

    @Get(`/:id/members`)
    async getMembers(@Param(`id`, ParseIntPipe) id: number) {
        return this.teamsService.getMembers(id);
    }

    @Get(`/:id/matches`)
    @Roles(Role.Organizer)
    async getMatchesByTeams(
        @Param(`id`, ParseIntPipe) id: number,
        @Query() { status }: MatchQuery,
    ) {
        return this.teamsService.getMatchesByTeams(id, status);
    }

    @Get(`/:id`)
    async get(@Param(`id`, ParseIntPipe) id: number) {
        return this.teamsService.getById(id);
    }

    @Public()
    @Get(`team-profile/:imgpath`)
    seeUploadedProfile(@Param(`imgpath`) image, @Res() res) {
        return res.sendFile(image, { root: `./uploads/teamProfileImages` });
    }

    @Public()
    @Get(`team-background/:imgpath`)
    seeUploadedBackground(@Param(`imgpath`) image, @Res() res) {
        return res.sendFile(image, { root: `./uploads/teamProfileBackgrounds` });
    }

    @Get()
    async getAll() {
        return this.teamsService.getAll();
    }

    @Post(`/upload-team-image/:id`)
    @UseGuards(UploadTeamImagesGuard)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/teamProfileImages`,
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
        return this.teamsService.setTeamProfile(id, image, user);
    }

    @Post(`/upload-team-background/:id`)
    @UseGuards(UploadTeamImagesGuard)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/teamProfileBackgrounds`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 4000000 },
        }),
    )
    async uploadedBackground(
        @UploadedFile() image,
        @Param(`id`, ParseIntPipe) id: number,
        @Req() { user }: RequestWithUser,
    ) {
        if (!image) {
            throw new BadRequestException(
                `invalid file provided, allowed formats jpg/png/jpng and max size 4mb`,
            );
        }
        return this.teamsService.setTeamBackground(id, image, user);
    }

    @Post()
    @Roles(Role.Player)
    async create(@Body() teamData: CreateTeamDto) {
        return this.teamsService.create(teamData);
    }

    @Patch(`/:teamId`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async update(@Param(`teamId`, ParseIntPipe) id: number, @Body() body: UpdateTeamDto) {
        return this.teamsService.update(id, body);
    }

    @Delete(`/:teamId`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async remove(@Param(`teamId`, ParseIntPipe) id: number) {
        return this.teamsService.remove(id);
    }
}
