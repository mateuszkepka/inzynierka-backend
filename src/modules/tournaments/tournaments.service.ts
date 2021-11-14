import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament, ParticipatingTeam, Team } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateParticipatingTeamDto } from './dto/create-participatingTeam.dto';
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
    ) {}

    async getById(tournamentId: number) {
        const tournament = await this.tournamentsRepository.findOne({ tournamentId });
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
        } else if (!tournament) {
            throw new NotFoundException(`Tournament with this id does not exist`);
        } else if (!team) {
            throw new NotFoundException(`Team with this id does not exist`);
        } else if (tournament.registerEndDate.getTime() >= tempDate.getTime()) {
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

    async create(tournament: CreateTournamentDto) {
        const newTournament = await this.tournamentsRepository.create(tournament);
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
