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
    UsePipes,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { UserIsCaptainGuard } from './guards/user-is-captain.guard';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { UpdateTeamDto } from './dto/update-team.dto';
import { MatchQueryDto } from '../matches/dto/get-matches.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/config/team-profile-upload.utils';

@Controller(`teams`)
@Roles(Role.User)
export class TeamsController {
    usersService: any;
    constructor(private readonly teamsService: TeamsService) { }

    @Get(`/:id/players/available`)
    async getAvailablePlayers(
        @Param(`id`, ParseIntPipe) id: number,
        @Req() { user }: RequestWithUser
    ) {
        return await this.teamsService.getAvailablePlayers(id, user);
    }

    @Get(`/:id/members`)
    async getMembers(@Param(`id`, ParseIntPipe) id: number) {
        return this.teamsService.getMembers(id);
    }

    @Get(`/:id/matches`)
    @Roles(Role.Organizer)
    async getMatchesByTeams(
        @Param(`id`, ParseIntPipe) id: number,
        @Query() status: MatchQueryDto
    ) {
        return this.teamsService.getMatchesByTeams(id, status);
    }

    @Get(`/:id`)
    async get(@Param(`id`, ParseIntPipe) id: number) {
        return await this.teamsService.getById(id);
    }

    @Get('team-image/:imgpath')
    seeUploadedFile(@Param('imgpath') image, @Res() res) {
        return res.sendFile(image, { root: './uploads/teamProfileImages' });
    }

    @Get()
    async getAll() {
        return await this.teamsService.getAll();
    }

    @Post('/upload-team-image/:id')
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads/teamProfileImages',
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,


        }),
    )
    uploadedFile(@UploadedFile() image, @Param(`id`, ParseIntPipe) id: number, @Req() { user }: RequestWithUser) {
        if (!image) {
            throw new BadRequestException('invalid file provided, allowed formats jpg/png/jpng!');
        }
        return this.teamsService.setTeamImage(id, image, user);
    }


    @Post()
    @Roles(Role.Player)
    async create(@Body() teamData: CreateTeamDto) {
        return await this.teamsService.create(teamData);
    }

    @Patch(`/:id`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateTeamDto) {
        return await this.teamsService.update(id, body);
    }

    @Delete(`/:id`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return await this.teamsService.remove(id);
    }
}
