import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament, ParticipatingTeam, Team, TournamentAdmin, Prize, User } from 'src/entities';
import { Connection, Repository } from 'typeorm';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { UsersService } from '../users/users.service';
import { AcceptTeamDto } from './dto/accept-team-dto';
import { CreateAdminDto } from './dto/create-admin-dto';
import { CreateParticipatingTeamDto } from './dto/create-participatingTeam.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';

@Injectable()
export class TournamentsService {
    constructor(
        @InjectRepository(Tournament) private readonly tournamentsRepository: Repository<Tournament>,
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        @InjectRepository(ParticipatingTeam) private readonly participatingTeamsRepository: Repository<ParticipatingTeam>,
        @InjectRepository(TournamentAdmin) private readonly tournamentAdminRepository: Repository<TournamentAdmin>,
        @InjectRepository(Prize) private readonly prizeRepository: Repository<Prize>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly usersService: UsersService,
        private readonly connection: Connection
    ) { }

    async getById(tournamentId: number) {
        const tournament = await this.tournamentsRepository.findOne({
            where: { tournamentId },
            relations: [`organizer`, `game`]
        });
        if (!tournament) {
            throw new NotFoundException(`Tournament with this id does not exist`);
        }
        return tournament;
    }

    async getAdmins(tournamentId: number, accepted: boolean) {
        const admins = await this.userRepository
            .createQueryBuilder(`user`)
            .innerJoin(`user.tournamentAdmins`, `admins`)
            .innerJoin(`admins.tournament`, `tournament`)
            .where(`tournament.tournamentId = :tournamentId`, { tournamentId: tournamentId })
            .andWhere(`admins.isAccepted = :accepted`, { accepted: accepted })
            .getMany()
        return admins;
    }

    /*async getByOrganizer(organizer: User) {
        const tournament = await this.tournamentsRepository.findOne({ organizer });
        if (tournament) {
            return tournament;
        }
        throw new NotFoundException(`User with this id does not exist`);
    } */

    async addTeam(participatingTeamData: CreateParticipatingTeamDto) {
        const tempDate = new Date();
        const tournamentId = participatingTeamData.tournamentId;
        const teamId = participatingTeamData.teamId;
        const tournament = await this.tournamentsRepository.findOne({ tournamentId });
        const team = await this.teamsRepository.findOne({ teamId });
        const test = await this.participatingTeamsRepository
            .createQueryBuilder(`participating_team`)
            .innerJoinAndSelect(`participating_team.team`, `team`)
            .innerJoinAndSelect(`participating_team.tournament`, `tournament`)
            .where(`team.teamId = :id and tournament.tournamentId = :id2`, {
                id: teamId,
                id2: tournamentId,
            })
            .getOne();
        if (test) {
            throw new NotFoundException(`This team is already signed up for this tournament`);
        }
        if (!tournament) {
            throw new NotFoundException(`Tournament with this id does not exist`);
        }
        if (!team) {
            throw new NotFoundException(`Team with this id does not exist`);
        }
        if (tournament.registerEndDate.getTime() >= tempDate.getTime()) {
            const tempTeam = new ParticipatingTeam();
            tempTeam.tournament = tournament;
            tempTeam.team = team;
            const datenow = new Date();
            tempTeam.signDate = datenow;
            tempTeam.isApproved = false;
            const participatingTeam = await this.participatingTeamsRepository.create(tempTeam);
            await this.participatingTeamsRepository.save(participatingTeam);
            return participatingTeam;
        } else throw new NotFoundException(`Register window for this tournament already passed`);
    }

    async getByName(name: string) {
        const tournament = await this.tournamentsRepository.findOne({ name });
        if (tournament) {
            return tournament;
        }
        throw new NotFoundException(`Tournament with such name does not exist`);
    }

    async getTeamsFiltered(tournamentId: number, approved: string) {
        const tournament = await this.getById(tournamentId);
        let teams = [];
        if (approved === undefined) {
            teams = await this.participatingTeamsRepository.find({
                where: {
                    tournament: tournament,
                },
                relations: [`tournament`, `team`],
            });
        }
        if (approved === `false` || approved === `true`)
            teams = await this.participatingTeamsRepository.find({
                where: {
                    tournament: tournament,
                    isApproved: approved,
                },
                relations: [`tournament`, `team`],
            });
        if (teams.length === 0) {
            throw new NotFoundException(`No teams to manage in this tournament`);
        }
        return teams;
    }

    async acceptTeam(acceptdata: AcceptTeamDto, request) {
        const { user } = request;
        const teaminvite = await this.participatingTeamsRepository.findOne({
            where: {
                participatingTeamId: acceptdata.participatingTeamId,
            },
            relations: [`tournament`],
        });
        const admins = await this.tournamentAdminRepository.find({
            where: {
                tournament: teaminvite.tournament,
            },
            relations: [`user`],
        });
        let isadmin = false;
        if (admins) {
            admins.forEach(function (element) {
                if (element.user.userId === user.userId) {
                    isadmin = true;
                }
            });
        }
        if (!isadmin) {
            throw new NotFoundException(`You dont have have permision to manage this tournament`);
        }
        if (teaminvite.isApproved) {
            throw new NotFoundException(`Team is already accepted to this Tournament`);
        }
        const teamlist = await this.participatingTeamsRepository
            .createQueryBuilder(`participating_team`)
            .innerJoinAndSelect(`participating_team.tournament`, `tournament`)
            .where(`tournament.tournamentId = :id and participating_team.isApproved = true`, {
                id: teaminvite.tournament.tournamentId,
            })
            .getMany();
        if (teamlist.length >= teaminvite.tournament.numberOfTeams) {
            throw new NotFoundException(`Maximum numer of accepted teams have been reached`);
        }
        if (!teaminvite) {
            throw new NotFoundException(`Wrong invitation ID`);
        }
        teaminvite.isApproved = true;
        await this.participatingTeamsRepository.save(teaminvite);
        return teaminvite;
    }

    async addAdmin(id: number, body: CreateAdminDto) {
        const tournament = await this.getById(id);
        const user = await this.usersService.getById(body.userId);
        return await this.tournamentAdminRepository.save({
            tournament: tournament,
            user: user
        });
    }

    async addPrize(id: number, body: CreatePrizeDto) {
        const tournament = await this.getById(id);
        return await this.prizeRepository.save({
            ...body,
            tournament: tournament
        });
    }

    //async removeAdmin(id: number, request) {
    //}

    async create(tournament: CreateTournamentDto, request) {
        const { user } = request;
        const newTournament = await this.tournamentsRepository.create(tournament);
        newTournament.organizer = user;
        await this.tournamentsRepository.save(newTournament);
        return newTournament;
    }

    async remove(id: number) {
        const tournament = await this.getById(id);
        if (!tournament) {
            throw new NotFoundException(`Tournament not found`);
        }
        return this.tournamentsRepository.remove(tournament);
    }

    async getAllTournaments() {
        const tournament = await this.tournamentsRepository.find();
        const tournaments = JSON.stringify(tournament);
        if (!tournaments) {
            throw new NotFoundException(`Not even single tournament exists in the system`);
        }
        return tournaments;
    }

    async update(id: number, attributes: Partial<Tournament>) {
        const tournament = await this.getById(id);
        if (!tournament) {
            throw new NotFoundException(`Tournament not found`);
        }

        Object.assign(tournament, attributes);
        return this.tournamentsRepository.save(tournament);
    }
}
