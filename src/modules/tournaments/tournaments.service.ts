import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament, ParticipatingTeam, Team, TournamentAdmin, Prize, User, Match, Suspension } from 'src/entities';
import { Repository } from 'typeorm';
import { GamesService } from '../games/games.service';
import { MatchQueryDto } from '../matches/dto/get-matches.dto';
import { PlayersService } from '../players/players.service';
import { SuspensionsService } from '../suspensions/suspensions.service';
import { TeamsService } from '../teams/teams.service';
import { UsersService } from '../users/users.service';
import { AcceptTeamDto } from './dto/accept-team-dto';
import { CreateAdminDto } from './dto/create-admin-dto';
import { CreateParticipatingTeamDto } from './dto/create-participating-team.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentQueryDto } from './dto/get-tournaments-dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentStatus } from './interfaces/tourrnament.status-enum';

@Injectable()
export class TournamentsService {
    constructor(
        @InjectRepository(Tournament) private readonly tournamentsRepository: Repository<Tournament>,
        @InjectRepository(ParticipatingTeam) private readonly rostersRepository: Repository<ParticipatingTeam>,
        @InjectRepository(TournamentAdmin) private readonly tournamentAdminsRepository: Repository<TournamentAdmin>,
        @InjectRepository(Prize) private readonly prizeRepository: Repository<Prize>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        private readonly suspensionsService: SuspensionsService,
        private readonly playersService: PlayersService,
        private readonly usersService: UsersService,
        private readonly teamsService: TeamsService,
        private readonly gamesService: GamesService
    ) { }

    async getTournamentsFiltered(queryParams: TournamentQueryDto) {
        const { status } = queryParams;
        const queryBuilder = this.tournamentsRepository
            .createQueryBuilder(`tournament`)
            .where(`1=1`)
        switch (status) {
            case TournamentStatus.Finished:
                queryBuilder.andWhere(`tournament.tournamentEndDate < :date`, { date: new Date() })
                break;
            case TournamentStatus.Ongoing:
                queryBuilder.andWhere(`tournament.tournamentStartDate < :date1`, { date1: new Date() })
                queryBuilder.andWhere(`tournament.tournamentEndDate > :date2`, { date2: new Date() })
                break;
            case TournamentStatus.Upcoming:
                queryBuilder.andWhere(`tournament.tournamentStartDate > :date`, { date: new Date() })
                break;
        }
        const tournaments = await queryBuilder.getMany();
        if (tournaments.length === 0) {
            throw new NotFoundException(`No tournaments found`);
        }
        return tournaments;
    }

    async getById(tournamentId: number) {
        const tournament = await this.tournamentsRepository.findOne({
            where: { tournamentId: tournamentId },
            relations: [`organizer`, `game`]
        });
        if (!tournament) {
            throw new NotFoundException(`Tournament with this id does not exist`);
        }
        return tournament;
    }

    async getByName(name: string) {
        const tournament = await this.tournamentsRepository.findOne({
            where: { name: name },
            relations: [`organizer`, `game`]
        });
        return tournament;
    }

    async getTeamsFiltered(tournamentId: number, approved: string) {
        await this.getById(tournamentId);
        const response = this.rostersRepository
            .createQueryBuilder(`participating_team`)
            .innerJoin(`participating_team.tournament`, `tournament`)
            .where(`1=1`)
        if (approved === `true` || approved === `false`) {
            response.andWhere(`participating_team.isApproved = :approved`, { approved })
        }
        const teams = await response.getMany()
        if (teams.length === 0) {
            throw new NotFoundException(`No teams found with given status found`)
        }
        return response.getMany();
    }

    async getAdmins(tournamentId: number, accepted: boolean) {
        const admins = await this.userRepository
            .createQueryBuilder(`user`)
            .innerJoin(`user.tournamentAdmins`, `admins`)
            .innerJoin(`admins.tournament`, `tournament`)
            .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId })
            .andWhere(`admins.isAccepted = :accepted`, { accepted: accepted })
            .getMany()
        if (admins.length === 0) {
            throw new NotFoundException(`No admins found for this tournament`);
        }
        return admins;
    }

    async getParticipatingTeam(participatingTeamId: number) {
        const participatingteam = await this.rostersRepository.findOne({
            where: { participatingTeamId: participatingTeamId },
            relations: [`tournament`, `team`],
        });
        if (!participatingteam) {
            throw new NotFoundException(`ParticipatingTeam with this id does not exist`);
        }
        return participatingteam;
    }

    async getMatchesByTournament(tournamentId: number, queryParams: MatchQueryDto) {
        const { status } = queryParams;
        const tournament = await this.getById(tournamentId);
        const matches = await this.matchesRepository.find({
            where: { status: status, tournament: tournament }
        })
        if (matches.length === 0) {
            throw new NotFoundException(`No matches with given status found`);
        }
        return matches;
    }

    async verifyTeam(tournamentId: number, teamId: number, body: AcceptTeamDto) {
        const tournament = await this.getById(tournamentId);
        const team = await this.teamsService.getById(teamId);
        const participatingTeam = await this.rostersRepository.findOne({
            where: { tournament: tournament, team: team }
        })
        if (!participatingTeam) {
            throw new BadRequestException(`This team is not participating in the tournament`);
        }
        const teams = await this.getTeamsFiltered(tournamentId, `true`);
        if (teams.length + 1 >= tournament.numberOfTeams) {
            throw new NotFoundException(`Maximum numer of accepted teams have been reached`);
        }
        participatingTeam.decisionDate = new Date();
        participatingTeam.isApproved = body.isApproved;
        return this.rostersRepository.save(participatingTeam);
    }

    async create(body: CreateTournamentDto, user: User) {
        const ifNameTaken = await this.getByName(body.name);
        if (ifNameTaken) {
            throw new BadRequestException(`This tournament name is already taken!`)
        }
        const game = await this.gamesService.getById(body.gameId);
        const tournament = this.tournamentsRepository.create({
            ...body,
            game: game,
            organizer: user
        });
        return this.tournamentsRepository.save(tournament);
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
        if (tournament.registerEndDate <= new Date()) {
            throw new BadRequestException(`Registration time for this tournament is over`);
        }
        const rosterExceptions = await this.validateRoster(team, roster);
        const subsExceptions = await this.validateRoster(team, subs);
        const exceptions = rosterExceptions.concat(subsExceptions);
        if (exceptions.length !== 0) {
            throw new BadRequestException(exceptions);
        }
        const ifParticipating = await this.rostersRepository.findOne({
            where: { tournament: tournament, team: team }
        })
        if (ifParticipating) {
            throw new NotFoundException(`This team is already signed up for this tournament`);
        }
        return this.rostersRepository.save({
            tournament: tournament,
            team: team,
            signDate: new Date(),
            roster: roster,
            subs: subs
        })
    }

    async validateRoster(team: Team, roster: string[]) {
        const exceptions = [];
        for (const nickname of roster) {
            const player = await this.playersService.getByNickname(nickname);
            if (!player) {
                exceptions.push(`Player with nickname ${nickname} does not exist`);
                continue;
            }
            const owner = await this.playersService.getOwner(player.playerId);
            const members = await this.teamsService.getMembers(team.teamId);
            if (!(members.some((member) => member.playerId === player.playerId))) {
                exceptions.push(`${player.summonerName} is not a member of team ${team.teamName}`);
            }
            try {
                const suspensions = await this.suspensionsService.getFiltered(owner.userId, `active`);
                if (suspensions.length !== 0) {
                    exceptions.push(`${player.summonerName} has an active suspension`)
                }
            } catch (ignore) { }
        }
        return exceptions;
    }

    async addAdmin(id: number, body: CreateAdminDto) {
        const tournament = await this.getById(id);
        const user = await this.usersService.getById(body.userId);
        const admin = this.tournamentAdminsRepository.create({
            tournament: tournament,
            user: user
        });
        return this.tournamentAdminsRepository.save(admin);
    }

    async addPrize(id: number, body: CreatePrizeDto) {
        const tournament = await this.getById(id);
        const prize = this.prizeRepository.create({
            ...body,
            tournament: tournament
        });
        return this.prizeRepository.save(prize);
    }

    async remove(id: number) {
        const tournament = await this.getById(id);
        return this.tournamentsRepository.remove(tournament);
    }
}