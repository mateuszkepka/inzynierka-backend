import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { Format, Group, GroupStanding, Ladder, Match, ParticipatingTeam, Player, Prize, Team, Tournament, TournamentAdmin, User } from 'src/database/entities';
import { Brackets, Connection, Repository } from 'typeorm';
import { TournamentFormat } from '../formats/dto/tournament-format.enum';
import { FormatsService } from '../formats/formats.service';
import { GamesService } from '../games/games.service';
import { MatchStatus } from '../matches/interfaces/match-status.enum';
import { PlayersService } from '../players/players.service';
import { ParticipationStatus } from '../teams/dto/participation-status';
import { TeamsService } from '../teams/teams.service';
import { UsersService } from '../users/users.service';
import { CreateParticipatingTeamDto, RosterMember } from './dto/create-participating-team.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentQueryDto } from './dto/get-tournaments-dto';
import { TournamentStatus } from './dto/tourrnament.status.enum';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { GroupsService } from './groups.service';
import { LaddersService } from './ladders.service';

@Injectable()
export class TournamentsService {
    constructor(
        @InjectRepository(Tournament) private readonly tournamentsRepository: Repository<Tournament>,
        @InjectRepository(ParticipatingTeam) private readonly rostersRepository: Repository<ParticipatingTeam>,
        @InjectRepository(GroupStanding) private readonly groupStandingsRepository: Repository<GroupStanding>,
        @InjectRepository(TournamentAdmin) private readonly tournamentAdminsRepository: Repository<TournamentAdmin>,
        @InjectRepository(Ladder) private readonly laddersRepository: Repository<Ladder>,
        @InjectRepository(Group) private readonly groupsRepository: Repository<Group>,
        @InjectRepository(Prize) private readonly prizeRepository: Repository<Prize>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly formatsService: FormatsService,
        private readonly playersService: PlayersService,
        private readonly laddersService: LaddersService,
        private readonly groupsService: GroupsService,
        private readonly usersService: UsersService,
        private readonly teamsService: TeamsService,
        private readonly gamesService: GamesService,
        private readonly connection: Connection,
    ) { }

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
            .leftJoinAndSelect(`tournament.game`, `game`)
            .leftJoinAndSelect(`tournament.organizer`, `organizer`)
            .leftJoinAndSelect(`tournament.prize`, `prize`)
            .leftJoinAndSelect(`tournament.format`, `format`)
            .where(`1=1`);
        if (status) {
            queryBuilder.andWhere(`tournament.status = :status`, { status: status });
        }
        const tournaments = await queryBuilder.getMany();
        return tournaments;
    }

    async getStandingsByTournament(tournamentId: number) {
        const tournament = await this.getById(tournamentId);
        const format = tournament.format.name;
        let standings: Group[] | Ladder[];
        if (new Date() > tournament.checkInCloseDate) {
            throw new NotFoundException(`Groups for this tournament aren't drawn yet`);
        }
        if (
            format === TournamentFormat.SingleRoundRobin ||
            format === TournamentFormat.DoubleRoundRobin
        ) {
            standings = await this.groupsRepository
                .createQueryBuilder(`group`)
                .addSelect([`team.teamId`, `team.teamName`])
                .innerJoinAndSelect(`group.standings`, `standing`)
                .leftJoin(`standing.team`, `team`)
                .leftJoin(`group.tournament`, `tournament`)
                .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId })
                .orderBy(`group.name`)
                .addOrderBy(`standing.place`)
                .getMany();
        }
        if (format === TournamentFormat.SingleEliminationLadder) {
            standings = await this.laddersRepository
                .createQueryBuilder(`ladder`)
                .addSelect([`match.matchId`, `match.status`, `match.winner`])
                .addSelect([
                    `firstTeam.teamId`,
                    `firstTeam.teamName`,
                    `secondTeam.teamId`,
                    `secondTeam.teamName`,
                ])
                .leftJoin(`ladder.tournament`, `tournament`)
                .leftJoinAndSelect(`ladder.matches`, `match`)
                .leftJoin(`match.firstTeam`, `firstTeam`)
                .leftJoin(`match.secondTeam`, `secondTeam`)
                .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId })
                .orderBy(`match.round`, `DESC`)
                .addOrderBy(`match.position`, `DESC`)
                .getMany();
        }
        if (format === TournamentFormat.DoubleEliminationLadder) {
            standings = await this.laddersRepository
                .createQueryBuilder(`ladder`)
                .addSelect([`match.matchId`, `match.status`, `match.winner`])
                .addSelect([
                    `firstTeam.teamId`,
                    `firstTeam.teamName`,
                    `secondTeam.teamId`,
                    `secondTeam.teamName`,
                ])
                .leftJoin(`ladder.tournament`, `tournament`)
                .leftJoinAndSelect(`ladder.matches`, `match`)
                .leftJoin(`match.firstTeam`, `firstTeam`)
                .leftJoin(`match.secondTeam`, `secondTeam`)
                .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId })
                .orderBy(`ladder.ladderId`)
                .addOrderBy(`match.round`, `DESC`)
                .addOrderBy(`match.position`, `ASC`)
                .getMany();
        }
        return standings;
    }

    async getTeamsByTournament(tournamentId: number, status: ParticipationStatus) {
        await this.getById(tournamentId);
        const response = this.rostersRepository
            .createQueryBuilder(`participating_team`)
            .leftJoin(`participating_team.tournament`, `tournament`)
            .leftJoinAndSelect(`participating_team.team`, `team`)
            .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId });
        if (status != null) {
            response.andWhere(`participating_team.status = :status`, { status });
        }
        const teams = await response.getMany();
        return teams;
    }

    async getMatchesByTournament(tournamentId: number, status: MatchStatus) {
        await this.getById(tournamentId);
        const qb = this.matchesRepository
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
            .where(`match.tournamentId = :tournamentId`, { tournamentId: tournamentId });
        if (status === MatchStatus.Scheduled) {
            qb.andWhere(
                new Brackets((subQuery) => {
                    subQuery
                        .orWhere(`match.status = :status`, {
                            status: MatchStatus.Scheduled,
                        })
                        .orWhere(`match.status = :status1`, {
                            status1: MatchStatus.Resolving,
                        })
                        .orWhere(`match.status = :status2`, {
                            status2: MatchStatus.Unresolved,
                        })
                        .orWhere(`match.status = :status3`, {
                            status3: MatchStatus.Postponed,
                        });
                }),
            );
        } else {
            qb.andWhere(`match.status = :status`, { status: status });
        }
        qb.orderBy(`match.matchId`);
        console.log(qb.getQuery());
        return qb.getMany();
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
            .innerJoin(`user.tournamentAdmins`, `admin`)
            .innerJoin(`admin.tournament`, `tournament`)
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
        const admin = this.tournamentAdminsRepository.create({
            tournament: tournament,
            user: user
        });
        await this.tournamentAdminsRepository.save(admin);
        await this.scheduleTournament(tournament);
        return tournament;
    }

    async update(id: number, attributes: Partial<UpdateTournamentDto>) {
        let format: Format;
        if (attributes.format != null) {
            format = await this.formatsService.getByName(attributes.format);
            delete attributes.format;
        }
        const tournament = await this.getById(id);
        Object.assign(tournament, attributes);
        tournament.format = format;
        return this.tournamentsRepository.save(tournament);
    }

    async addTeam(tournamentId: number, teamId: number, body: CreateParticipatingTeamDto) {
        const { roster, subs } = body;
        const tournament = await this.getById(tournamentId);
        const team = await this.teamsService.getById(teamId);
        if (roster.length > tournament.numberOfPlayers) {
            throw new BadRequestException(
                `This tournament is limited to ${tournament.numberOfPlayers} players per team`,
            );
        }
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
        if (teams.length + 1 > tournament.numberOfTeams) {
            throw new NotFoundException(`Maximum numer of accepted teams has been reached`);
        }
        const rosterExceptions = await this.validateRoster(team, roster);
        if (subs) {
            const subsExceptions = await this.validateRoster(team, subs);
            const exceptions = rosterExceptions.concat(subsExceptions);
            if (exceptions.length !== 0) {
                throw new BadRequestException(exceptions);
            }
        }
        const ifParticipating = await this.rostersRepository.findOne({
            where: { tournament: tournament, team: team },
        });
        if (ifParticipating) {
            throw new NotFoundException(`Your team is already signed up for this tournament`);
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

    async addAdmin(tournamentId: number, adminId: number) {
        const tournament = await this.getById(tournamentId);
        const user = await this.usersService.getById(adminId);
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
        await this.connection.transaction(async (manager) => {
            tournament.prize = prize;
            await manager.save(tournament);
            await manager.save(prize);
        });
        return prize;
    }

    async updatePrize(prizeId: number, attributes: Partial<UpdatePrizeDto>) {
        const prize = await this.prizeRepository.findOne({
            where: { prizeId: prizeId },
        });
        Object.assign(prize, attributes);
        return this.prizeRepository.save(prize);
    }

    async remove(id: number) {
        const tournament = await this.getById(id);
        return this.tournamentsRepository.remove(tournament);
    }

    async removeAdmin(tournamentId: number, adminId: number) {
        const tournament = await this.getById(tournamentId);
        const user = await this.usersService.getById(adminId);
        const admin = await this.tournamentAdminsRepository.findOne({
            where: { tournament: tournament, user: user },
        });
        return this.tournamentAdminsRepository.remove(admin);
    }

    public async setTournamentProfile(id: number, image: Express.Multer.File) {
        const tournament = await this.getById(id);
        if (tournament.profilePicture) {
            if (tournament.profilePicture !== `default-tournament-avatar.png`) {
                const fs = require(`fs`);
                const path = `./uploads/tournaments/avatars/` + tournament.profilePicture;
                try {
                    fs.unlinkSync(path);
                } catch (err) {
                    console.error(`Previous tournament profile failed to remove`);
                }
            }
        }
        tournament.profilePicture = image.filename;
        this.tournamentsRepository.save(tournament);
        return tournament;
    }

    public async setTournamentBackground(id: number, image: Express.Multer.File) {
        const tournament = await this.getById(id);
        if (tournament.backgroundPicture) {
            if (tournament.backgroundPicture !== `default-tournament-background.png`) {
                const fs = require(`fs`);
                const path = `./uploads/tournaments/backgrounds/` + tournament.backgroundPicture;
                try {
                    fs.unlinkSync(path);
                } catch (err) {
                    console.error(`Previous tournament background failed to remove`);
                }
            }
        }
        tournament.backgroundPicture = image.filename;
        this.tournamentsRepository.save(tournament);
        return tournament;
    }

    private async validateRoster(team: Team, roster: RosterMember[]) {
        const exceptions = [];
        for (const member of roster) {
            let player: Player;
            const user = await this.usersService.getByUsername(member.username);
            if (!user) {
                exceptions.push(`User with username ${member.username} does not exist`);
            }
            try {
                player = await this.playersService.getById(member.playerId);
            } catch (ignore) {
                exceptions.push(`Player with id ${member.playerId} does not exist`);
            }
            if (!(user && player)) {
                return;
            }
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
        }
        return exceptions;
    }

    private async scheduleTournament(tournament: Tournament) {
        const jobName = `tournament${tournament.tournamentId}`;
        const time = new Date(tournament.checkInCloseDate.valueOf());
        const job = new CronJob(time, async () => {
            const teams = await this.getTeamsByTournament(
                tournament.tournamentId,
                ParticipationStatus.CheckedIn,
            );
            const format = tournament.format.name;
            if (format === TournamentFormat.SingleRoundRobin) {
                await this.groupsService.drawGroups(tournament, teams, 1);
            }
            if (format === TournamentFormat.DoubleRoundRobin) {
                await this.groupsService.drawGroups(tournament, teams, 2);
            }
            if (format === TournamentFormat.SingleEliminationLadder) {
                await this.laddersService.generateLadder(tournament, teams, false);
            }
            if (format === TournamentFormat.DoubleEliminationLadder) {
                await this.laddersService.generateLadder(tournament, teams, true);
            }
            tournament.status = TournamentStatus.Ongoing;
            await this.tournamentsRepository.save(tournament);
        });
        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
    }
}
