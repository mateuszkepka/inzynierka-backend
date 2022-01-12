import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Tournament,
    ParticipatingTeam,
    Team,
    TournamentAdmin,
    Prize,
    User,
    Match,
    Player,
    Ladder,
    Group,
    GroupStanding,
} from 'src/entities';
import { Repository } from 'typeorm';
import { FormatsService } from '../formats/formats.service';
import { GamesService } from '../games/games.service';
import { PlayersService } from '../players/players.service';
import { SuspensionsService } from '../suspensions/suspensions.service';
import { TeamsService } from '../teams/teams.service';
import { UsersService } from '../users/users.service';
import { CreateAdminDto } from './dto/create-admin-dto';
import { CreateParticipatingTeamDto, RosterMember } from './dto/create-participating-team.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentQueryDto } from './dto/get-tournaments-dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { TournamentFormat } from '../formats/dto/tournament-format-enum';
import { CronJob } from 'cron';
import { ParticipationStatus } from '../teams/dto/participation-status';
import { MatchStatus } from '../matches/interfaces/match-status.enum';
import { GroupsService } from './groups.service';
import { BracketsService } from './brackets.service';
import { TournamentStatus } from './dto/tourrnament.status-enum';

@Injectable()
export class TournamentsService {
    constructor(
        @InjectRepository(Tournament)
        private readonly tournamentsRepository: Repository<Tournament>,
        @InjectRepository(ParticipatingTeam)
        private readonly rostersRepository: Repository<ParticipatingTeam>,
        @InjectRepository(GroupStanding)
        private readonly groupStandingsRepository: Repository<GroupStanding>,
        @InjectRepository(TournamentAdmin)
        private readonly tournamentAdminsRepository: Repository<TournamentAdmin>,
        @InjectRepository(Ladder) private readonly laddersRepository: Repository<Ladder>,
        @InjectRepository(Group) private readonly groupsRepository: Repository<Group>,
        @InjectRepository(Prize) private readonly prizeRepository: Repository<Prize>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        private readonly suspensionsService: SuspensionsService,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly formatsService: FormatsService,
        private readonly playersService: PlayersService,
        private readonly bracketsService: BracketsService,
        private readonly groupsService: GroupsService,
        private readonly usersService: UsersService,
        private readonly teamsService: TeamsService,
        private readonly gamesService: GamesService,
    ) {}

    async test() {
        const tournament = await this.getById(6);
        const participatingTeams = await this.rostersRepository
            .createQueryBuilder(`participatingTeam`)
            .limit(31)
            .getMany();
        this.bracketsService.generateLadder(tournament, participatingTeams, true);
    }

    async getById(tournamentId: number) {
        const tournament = await this.tournamentsRepository.findOne({
            where: { tournamentId: tournamentId },
            relations: [`organizer`, `game`, `format`, `ladders`],
        });
        if (!tournament) {
            throw new NotFoundException(`Tournament with this id does not exist`);
        }
        return tournament;
    }

    async getByName(name: string) {
        const tournament = await this.tournamentsRepository.findOne({
            where: { name: name },
            relations: [`organizer`, `game`],
        });
        return tournament;
    }

    async getTournamentsFiltered(queryParams: TournamentQueryDto) {
        const { status } = queryParams;
        const queryBuilder = this.tournamentsRepository
            .createQueryBuilder(`tournament`)
            .innerJoinAndSelect(`tournament.game`, `game`)
            .innerJoinAndSelect(`tournament.organizer`, `organizer`)
            .innerJoinAndSelect(`tournament.prize`, `prize`)
            .where(`1=1`);
        if (status) {
            queryBuilder.andWhere(`tournament.status = :status`, { status: status });
        }
        const tournaments = await queryBuilder.getMany();
        if (tournaments.length === 0) {
            throw new NotFoundException(`No tournaments found`);
        }
        return tournaments;
    }

    async getStandingsByTournament(tournamentId: number) {
        const tournament = await this.getById(tournamentId);
        const format = tournament.format.name;
        let standings: Group[] | Ladder[];
        if (
            format === TournamentFormat.SingleRoundRobin ||
            format === TournamentFormat.DoubleRoundRobin
        ) {
            // TODO uncomment date check for production
            // if (new Date() < tournament.checkInCloseDate) {
            //     throw new NotFoundException(`Groups for this tournament aren't drawn yet`);
            // }
            standings = await this.groupsRepository
                .createQueryBuilder(`group`)
                .addSelect([`team.teamId`, `team.teamName`])
                .innerJoinAndSelect(`group.standings`, `standing`)
                .innerJoin(`standing.team`, `team`)
                .innerJoin(`group.tournament`, `tournament`)
                .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId })
                .orderBy(`group.name`)
                .addOrderBy(`standing.place`)
                .getMany();
        }
        if (format === TournamentFormat.SingleEliminationLadder) {
            // if (new Date() < tournament.checkInCloseDate) {
            //     throw new NotFoundException(`Brackets for this tournament aren't drawn yet`);
            // }
            standings = await this.laddersRepository
                .createQueryBuilder(`ladder`)
                .addSelect([`match.matchId`, `match.status`, `match.winner`])
                .addSelect([
                    `firstTeam.teamId`,
                    `firstTeam.teamName`,
                    `secondTeam.teamId`,
                    `secondTeam.teamName`,
                ])
                .innerJoin(`ladder.tournament`, `tournament`)
                .innerJoinAndSelect(`ladder.standings`, `standing`)
                .innerJoin(`standing.match`, `match`)
                .innerJoin(`match.firstTeam`, `firstTeam`)
                .innerJoin(`match.secondTeam`, `secondTeam`)
                .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId })
                .getMany();
        }
        if (format === TournamentFormat.DoubleEliminationLadder) {
            // if (new Date() < tournament.checkInCloseDate) {
            //     throw new NotFoundException(`Brackets for this tournament aren't drawn yet`);
            // }
            // TODO
            standings = await this.laddersRepository
                .createQueryBuilder(`ladder`)
                .addSelect([`match.matchId`, `match.status`, `match.winner`])
                .addSelect([
                    `firstTeam.teamId`,
                    `firstTeam.teamName`,
                    `secondTeam.teamId`,
                    `secondTeam.teamName`,
                ])
                .innerJoin(`ladder.tournament`, `tournament`)
                .innerJoinAndSelect(`ladder.standings`, `standing`)
                .innerJoin(`standing.match`, `match`)
                .innerJoin(`match.firstTeam`, `firstTeam`)
                .innerJoin(`match.secondTeam`, `secondTeam`)
                .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId })
                .getMany();
        }
        if (!standings) {
            throw new NotFoundException(`Standings for this tournament not found`);
        }
        return standings;
    }

    async getTeamsByTournament(tournamentId: number, status: ParticipationStatus) {
        await this.getById(tournamentId);
        const response = this.rostersRepository
            .createQueryBuilder(`participating_team`)
            .addSelect(`team.teamId`)
            .addSelect(`team.teamName`)
            .innerJoin(`participating_team.tournament`, `tournament`)
            .innerJoin(`participating_team.team`, `team`)
            .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId });
        if (status) {
            response.andWhere(`participating_team.status = :status`, { status });
        }
        const teams = await response.getMany();
        if (teams.length === 0) {
            throw new NotFoundException(`No teams with given status found`);
        }
        return teams;
    }

    async getMatchesByTournament(tournamentId: number, status: MatchStatus) {
        await this.getById(tournamentId);
        const matches = await this.matchesRepository
            .createQueryBuilder(`match`)
            .addSelect([`firstRoster.team`, `secondRoster.team`])
            .addSelect([`firstRoster.participatingTeamId`, `secondRoster.participatingTeamId`])
            .addSelect([
                `firstTeam.teamId`,
                `firstTeam.teamName`,
                `secondTeam.teamId`,
                `secondTeam.teamName`,
            ])
            .innerJoin(`match.firstRoster`, `firstRoster`)
            .innerJoin(`match.secondRoster`, `secondRoster`)
            .innerJoin(`firstRoster.team`, `firstTeam`)
            .innerJoin(`secondRoster.team`, `secondTeam`)
            .where(`match.status = :status`, { status: status })
            .andWhere(`match.tournamentId = :tournamentId`, { tournamentId: tournamentId })
            .getMany();
        if (matches.length === 0) {
            throw new NotFoundException(`No matches with given status found`);
        }
        return matches;
    }

    async getAvailableAdmins(tournamentId: number, user: User) {
        const tournament = await this.getById(tournamentId);
        const players = await this.userRepository
            .createQueryBuilder(`user`)
            .where(`user.userId != :userId`, { userId: user.userId })
            .andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select(`user.userId`)
                    .from(User, `user`)
                    .innerJoin(`user.tournamentAdmins`, `admin`)
                    .innerJoin(`admin.tournament`, `tournament`)
                    .where(`tournament.tournamentId = :tournamentId`, {
                        tournamentId: tournament.tournamentId,
                    })
                    .getQuery();
                return `user.userId NOT IN ` + subQuery;
            })
            .orderBy(`user.userId`)
            .getMany();
        if (players.length === 0) {
            throw new NotFoundException(`No admins to invite found`);
        }
        return players;
    }

    async getAdmins(tournamentId: number) {
        const admins = await this.userRepository
            .createQueryBuilder(`user`)
            .innerJoin(`user.tournamentAdmins`, `admins`)
            .innerJoin(`admins.tournament`, `tournament`)
            .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId })
            .getMany();
        if (admins.length === 0) {
            throw new NotFoundException(`No admins found for this tournament`);
        }
        return admins;
    }

    async getGroupById(groupId: number) {
        const group = await this.groupsRepository.findOne({
            relations: [`standings`, `standings.roster`, `standings.team`],
            where: { groupId: groupId },
        });
        if (!group) {
            throw new NotFoundException(`Group with given id doest not exist!`);
        }
        return group;
    }

    async getParticipatingTeamById(participatingTeamId: number) {
        const participatingteam = await this.rostersRepository.findOne({
            where: { participatingTeamId: participatingTeamId },
            relations: [`tournament`, `team`],
        });
        if (!participatingteam) {
            throw new NotFoundException(`ParticipatingTeam with this id does not exist`);
        }
        return participatingteam;
    }

    async getGroups(tournamentId: number) {
        const tournament = await this.getById(tournamentId);
        const group = await this.groupsRepository.find({
            where: { tournament: tournament },
        });
        return group;
    }

    async getGroupsStanding(standingId: number) {
        const standing = await this.groupStandingsRepository.findOne({
            relations: [`team`, `roster`],
            where: { groupStandingId: standingId },
        });
        return standing;
    }

    async getLadder(tournament: Tournament, isLosers: boolean) {
        const ladder = await this.laddersRepository.findOne({
            where: { tournament: tournament, isLosers: isLosers },
        });
        return ladder;
    }

    async getMaxRound(ladderId: number) {
        const round = await this.matchesRepository
            .createQueryBuilder(`match`)
            .select(`MAX(match.round)`)
            .innerJoin(`match.ladder`, `ladder`)
            .where(`ladder.ladderId = :ladderId`, { ladderId: ladderId })
            .getRawOne();
        return round;
    }

    async getMaxPositionInRound(ladderId: number, round: number) {
        const position = await this.matchesRepository
            .createQueryBuilder(`match`)
            .select(`MAX(match.position)`)
            .innerJoin(`match.ladder`, `ladder`)
            .where(`ladder.ladderId = :ladderId`, { ladderId: ladderId })
            .andWhere(`match.round = :round`, { round: round })
            .getRawOne();
        return position;
    }

    async changeStatus(tournamentId: number, teamId: number, status: ParticipationStatus) {
        const tournament = await this.getById(tournamentId);
        const team = await this.teamsService.getById(teamId);
        const participatingTeam = await this.rostersRepository.findOne({
            where: { tournament: tournament, team: team },
        });
        if (!participatingTeam) {
            throw new BadRequestException(`This team is not participating in the tournament`);
        }
        if (status === ParticipationStatus.Verified || status === ParticipationStatus.Unverified) {
            participatingTeam.verificationDate = new Date();
        }
        if (status === ParticipationStatus.CheckedIn) {
            if (participatingTeam.status !== ParticipationStatus.Verified) {
                throw new ForbiddenException(`Only verified teams can check in`);
            }
            if (tournament.checkInOpenDate > new Date()) {
                throw new BadRequestException(`Check in for this tournament hasn't started yet`);
            }
            if (tournament.checkInCloseDate <= new Date()) {
                throw new BadRequestException(`Check in time for this tournament is over`);
            }
            participatingTeam.checkInDate = new Date();
        }
        participatingTeam.status = status;
        return this.rostersRepository.save(participatingTeam);
    }

    async create(body: CreateTournamentDto, user: User) {
        const ifNameTaken = await this.getByName(body.name);
        if (ifNameTaken) {
            throw new BadRequestException(`This tournament name is already taken!`);
        }
        const game = await this.gamesService.getById(body.gameId);
        const format = await this.formatsService.getByName(body.format);
        const tournament = this.tournamentsRepository.create({
            ...body,
            game: game,
            format: format,
            organizer: user,
            status: TournamentStatus.Upcoming,
        });
        await this.tournamentsRepository.save(tournament);
        this.scheduleTournament(tournament);
        return tournament;
    }

    async update(id: number, attributes: Partial<UpdateTournamentDto>) {
        const tournament = await this.getById(id);
        Object.assign(tournament, attributes);
        return this.tournamentsRepository.save(tournament);
    }

    async addTeam(tournamentId: number, body: CreateParticipatingTeamDto) {
        const { teamId, roster, subs } = body;
        const tournament = await this.getById(tournamentId);
        const team = await this.teamsService.getById(teamId);
        if (tournament.registerStartDate > new Date()) {
            throw new BadRequestException(`Registration for this tournament is not open yet`);
        }
        if (tournament.registerEndDate <= new Date()) {
            throw new BadRequestException(`Registration time for this tournament is over`);
        }
        const teams = await this.getTeamsByTournament(
            tournamentId,
            ParticipationStatus.Signed,
        ).catch((ignore) => ignore);
        if (teams.length + 1 >= tournament.numberOfTeams) {
            throw new NotFoundException(`Maximum numer of accepted teams has been reached`);
        }
        const rosterExceptions = await this.validateRoster(team, roster);
        const subsExceptions = await this.validateRoster(team, subs);
        const exceptions = rosterExceptions.concat(subsExceptions);
        if (exceptions.length !== 0) {
            throw new BadRequestException(exceptions);
        }
        const ifParticipating = await this.rostersRepository.findOne({
            where: { tournament: tournament, team: team },
        });
        if (ifParticipating) {
            throw new NotFoundException(`This team is already signed up for this tournament`);
        }
        const participatingTeam = this.rostersRepository.create({
            tournament: tournament,
            team: team,
            signDate: new Date(),
            roster: roster,
            subs: subs,
        });
        return this.rostersRepository.save(participatingTeam);
    }

    async addAdmin(id: number, body: CreateAdminDto) {
        const tournament = await this.getById(id);
        const user = await this.usersService.getById(body.userId);
        const admin = this.tournamentAdminsRepository.create({
            tournament: tournament,
            user: user,
        });
        return this.tournamentAdminsRepository.save(admin);
    }

    async addPrize(id: number, body: CreatePrizeDto) {
        const tournament = await this.getById(id);
        const prize = this.prizeRepository.create({
            ...body,
            tournament: tournament,
        });
        return this.prizeRepository.save(prize);
    }

    async remove(id: number) {
        const tournament = await this.getById(id);
        return this.tournamentsRepository.remove(tournament);
    }

    public async setTournamentProfile(id, image, user) {
        const tournament = await this.getById(id);
        if (tournament.tournamentProfileImage) {
            if (tournament.tournamentProfileImage !== `default-tournament-profile.png`) {
                const fs = require(`fs`);
                const path =
                    `./uploads/tournamentProfileImages/` + tournament.tournamentProfileImage;
                try {
                    fs.unlinkSync(path);
                } catch (err) {
                    console.error(`Previous user avatar failed to remove`);
                }
            }
        }
        tournament.tournamentProfileImage = image.filename;
        this.tournamentsRepository.save(tournament);
        return tournament;
    }

    private async validateRoster(team: Team, roster: RosterMember[]) {
        const exceptions = [];
        for (const member of roster) {
            var user: User;
            var player: Player;
            try {
                user = await this.usersService.getByUsername(member.username);
            } catch (ignore) {
                exceptions.push(`User with username ${member.username} does not exist`);
            }
            try {
                player = await this.playersService.getById(member.playerId);
            } catch (ignore) {
                exceptions.push(`Player with id ${member.playerId} does not exist`);
            }
            if (user && player) {
                if (player.user.userId !== user.userId) {
                    exceptions.push(
                        `Username ${member.username} and playerId ${member.playerId} mismatch`,
                    );
                }
                const members = await this.teamsService.getMembers(team.teamId);
                if (!members.some((member) => member.playerId === player.playerId)) {
                    exceptions.push(
                        `Player with id ${player.playerId} is not a member of team ${team.teamName}`,
                    );
                }
                try {
                    const suspensions = await this.suspensionsService.getFiltered(
                        user.userId,
                        `active`,
                    );
                    if (suspensions.length !== 0) {
                        exceptions.push(`${player.summonerName} has an active suspension`);
                    }
                } catch (ignore) {}
            }
        }
        return exceptions;
    }

    private async scheduleTournament(tournament: Tournament) {
        const { tournamentId } = tournament;
        const jobName = `tournament${tournament.tournamentId}`;
        const job = new CronJob(tournament.checkInCloseDate, async () => {
            const teams = await this.getTeamsByTournament(tournamentId, undefined);
            const format = tournament.format.name;
            if (
                format === TournamentFormat.SingleRoundRobin ||
                format === TournamentFormat.DoubleRoundRobin
            ) {
                console.log(`Group draw scheduled at ${tournament.checkInCloseDate}`);
                await this.groupsService.drawGroups(tournament, teams);
            }
            if (format === TournamentFormat.SingleEliminationLadder) {
                console.log(`Bracket draw scheduled at ${tournament.checkInCloseDate}`);
                await this.bracketsService.generateLadder(tournament, teams, false);
            }
            if (format === TournamentFormat.DoubleEliminationLadder) {
                console.log(`Bracket draw scheduled at ${tournament.checkInCloseDate}`);
                await this.bracketsService.generateLadder(tournament, teams, true);
            }
        });
        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
    }
}
