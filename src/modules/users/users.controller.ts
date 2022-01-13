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
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { MatchQuery } from '../matches/dto/get-matches.dto';
import { GetUsersTournamentsQuery } from './dto/get-users-tournaments.dto';
import { RolesDto } from './dto/roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { editFileName, imageFileFilter } from 'src/utils/uploads-util';
import { Public } from 'src/roles/public.decorator';
import { UserIsUserGuard } from './guards/user-is-user.guard';

@Controller(`users`)
@Roles(Role.User)
@UsePipes(
    new ValidationPipe({
        whitelist: true,
        transform: true,
    }),
)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(`/:id/accounts`)
    async getAccounts(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getAccounts(id);
    }

    @Get(`/:id/tournaments`)
    async getTournaments(
        @Param(`id`, ParseIntPipe) id: number,
        @Query() queryParams: GetUsersTournamentsQuery,
    ) {
        return this.usersService.getTournamentsByUser(id, queryParams);
    }

    @Get(`/:id/matches`)
    async getMatches(@Param(`id`, ParseIntPipe) id: number, @Query() { status }: MatchQuery) {
        return this.usersService.getMatchesByUser(id, status);
    }

    @Get(`/:id/teams`)
    async getTeams(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getTeamsByUser(id);
    }

    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getById(id);
    }

    @Get(`:id/profile-picture`)
    async getProfilePicture(@Param(`imgpath`) image, @Res() res) {
        return res.sendFile(image, { root: `./uploads/user-profile-pictures` });
    }

    @Get(`:id/profile-background`)
    async getProfileBackground(@Param(`imgpath`) image, @Res() res) {
        return res.sendFile(image, { root: `./uploads/user-profile-backgrounds` });
    }

    @Post(`:id/profile-picture`)
    @UseGuards(UserIsUserGuard)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/user-profile-pictures`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
        }),
    )
    async uploadProfilePicture(@UploadedFile() image: Express.Multer.File, @Param(`id`, ParseIntPipe) id: number) {
        if (!image) {
            throw new BadRequestException(`Invalid file provided, allowed formats jpg/png/jpeg!`);
        }
        return this.usersService.setProfileImage(id, image);
    }

    @Post(`:id/profile-background`)
    @UseGuards(UserIsUserGuard)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/user-profile-backgrounds`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
        }),
    )
    async uploadBackgroundPicture(@UploadedFile() image: Express.Multer.File, @Param(`id`, ParseIntPipe) id: number) {
        if (!image) {
            throw new BadRequestException(`Invalid file provided, allowed formats jpg/png/jpeg!`);
        }
        return this.usersService.setBackgroundPicture(id, image);
    }

    @Post(`/:id/roles/grant`)
    @Roles(Role.Admin)
    async grantRole(@Param(`id`, ParseIntPipe) id: number, @Body() body: RolesDto) {
        return this.usersService.grantRole(id, body);
    }

    @Patch(`/:id`)
    @UseGuards(UserIsUserGuard)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
        return this.usersService.update(id, body);
    }

    @Delete(`/:id`)
    @UseGuards(UserIsUserGuard)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    @Post(`/:id/roles/revoke`)
    @Roles(Role.Admin)
    async revokeRole(@Param(`id`, ParseIntPipe) id: number, @Body() body: RolesDto) {
        return this.usersService.revokeRole(id, body);
    }
}
