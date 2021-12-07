import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament, ParticipatingTeam, Team, TournamentAdmin, Prize, User } from 'src/entities';
import { Repository } from 'typeorm';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { AcceptTeamDto } from './dto/accept-team-dto';
import { CreateAdminDto } from './dto/create-admin-dto';
import { CreateParticipatingTeamDto } from './dto/create-participatingTeam.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';

@Injectable()
export class TournamentsService {
    constructor(
        @InjectRepository(Tournament)
        private readonly tournamentsRepository: Repository<Tournament>,
        @InjectRepository(Team)
        private readonly teamsRepository: Repository<Team>,
        @InjectRepository(ParticipatingTeam)
        private readonly participatingTeamsRepository: Repository<ParticipatingTeam>,
        @InjectRepository(TournamentAdmin)
        private readonly tournamentAdminRepository: Repository<TournamentAdmin>,
        @InjectRepository(Prize)
        private readonly prizeRepository: Repository<Prize>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getById(tournamentId: number) {
        const tournament = await this.tournamentsRepository.findOne(
            { tournamentId },
            { relations: [`prize`] },
        );
        if (tournament) {
            return tournament;
        }
        throw new NotFoundException(`Tournament with this id does not exist`);
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

    async getManagedTournaments(request: RequestWithUser) {
        const { user } = request;
        const tournamentList = await this.tournamentAdminRepository.find({
            where: {
                user: user,
            },
            relations: [`tournament`],
        });
        if (!tournamentList) {
            throw new NotFoundException(`You dont manage any tournaments!`);
        }
        const tournamentListt = JSON.stringify(tournamentList);
        return tournamentListt;
    }

    async getPendingTeamsList(tournamentId: number, request: RequestWithUser) {
        const { user } = request;
        const tournament = await this.tournamentsRepository.findOne({
            where: {
                tournamentId: tournamentId,
            },
            relations: [`tournamentAdmins`],
        });
        const admins = await this.tournamentAdminRepository.find({
            where: {
                tournament: tournament,
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
        const teamslist = await this.participatingTeamsRepository.find({
            where: {
                tournament: tournament,
                isApproved: false,
            },
            relations: [`tournament`, `team`],
        });
        if (!teamslist) {
            throw new NotFoundException(`No teams to manage in this tournament`);
        }
        return teamslist;
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

    //For now this is for testing I will complete it later
    async addAdmin(admindata: CreateAdminDto, request) {
        const { user } = request;
        const tournament = await this.tournamentsRepository.findOne({
            where: {
                tournamentId: admindata.tournamentId,
            },
            relations: [`tournamentAdmins`, `organizer`],
        });
        if (!tournament) {
            throw new NotFoundException(`Such tournament does not exist`);
        }
        if (tournament.organizer.userId !== user.userId) {
            throw new NotFoundException(
                `You dont have have permision to create admins for this tournament`,
            );
        }
        const admin = await this.userRepository.findOne({
            where: {
                userId: admindata.userId,
            },
            relations: [`tournamentAdmins`],
        });
        const adminCheck = await this.tournamentAdminRepository
            .createQueryBuilder(`tournament_admin`)
            .innerJoinAndSelect(`tournament_admin.tournament`, `tournament`)
            .innerJoinAndSelect(`tournament_admin.user`, `user`)
            .where(`tournament.tournamentId = :id and user.userId = :id2`, {
                id: admindata.tournamentId,
                id2: admindata.userId,
            })
            .getOne();
        if (adminCheck) {
            throw new NotFoundException(`This admin is already added to this Tournament`);
        }
        const tournamentAdmin = new TournamentAdmin();
        tournamentAdmin.isAccepted = false;
        tournamentAdmin.tournament = tournament;
        tournamentAdmin.user = admin;
        await this.tournamentAdminRepository.save(tournamentAdmin);
        return tournamentAdmin;
    }

    async addPrize(prize: CreatePrizeDto, request) {
        const { user } = request;
        const tournament = await this.tournamentsRepository.findOne({
            where: {
                tournamentId: prize.tournamentId,
            },
            relations: [`prize`, `organizer`],
        });
        if (!tournament) {
            throw new NotFoundException(`Such tournament does not exist`);
        }
        if (tournament.organizer.userId !== user.userId) {
            throw new NotFoundException(
                `You dont have permission to add Prizes to this Tournament`,
            );
        }
        const oldprize = tournament.prize;
        const newprize = new Prize();
        newprize.currency = prize.currency;
        newprize.distribution = prize.distribution;
        newprize.tournament = tournament;
        await this.prizeRepository.save(newprize);
        if (oldprize) {
            await this.prizeRepository.delete({ prizeId: oldprize.prizeId });
        }
        tournament.prize = newprize;
        await this.tournamentsRepository.save(tournament);
        return tournament;
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
