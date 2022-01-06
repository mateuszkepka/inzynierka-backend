import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Group, GroupStanding, Match, ParticipatingTeam, Tournament } from "src/entities";
import { Repository } from "typeorm";
import { TournamentFormat } from "../formats/dto/tournament-format-enum";
import { MatchStatus } from "../matches/interfaces/match-status.enum";
import { TeamsService } from "../teams/teams.service";
import { shuffle } from "./tournaments.service";

@Injectable()
export class GroupsService {
    constructor(
        @InjectRepository(ParticipatingTeam) private readonly rostersRepository: Repository<ParticipatingTeam>,
        @InjectRepository(GroupStanding) private readonly standingsRepository: Repository<GroupStanding>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(Group) private readonly groupsRepository: Repository<Group>,
        private readonly teamsService: TeamsService
    ) { }

    async drawGroups(tournament: Tournament, teams: ParticipatingTeam[]) {
        // shuffling teams array
        teams = shuffle(teams);

        // creating group names for the tournament
        for (let i = 0; i < tournament.numberOfGroups; i++) {
            await this.groupsRepository.save({
                name: String.fromCharCode(i + 65),
                tournament: tournament,
            });
        }
        const groups = await this.getGroupsByTournament(tournament);
        // assigning teams to particular groups
        groups.forEach(async (group) => {
            if (teams.length > 0) {
                const roster = teams.pop();
                await this.standingsRepository.save({
                    place: 0,
                    points: 0,
                    group: group,
                    team: roster.team,
                    roster: roster
                })
            }
        })
        let numberOfGames = 0;
        if (tournament.format.name === TournamentFormat.SingleRoundRobin) {
            numberOfGames = 1;
        }
        if (tournament.format.name === TournamentFormat.DoubleRoundRobin) {
            numberOfGames = 2;
        }
        // scheduling matches for each group
        groups.forEach(async (group) => {
            await this.makeRoundRobinPairings(tournament, group, numberOfGames);
        })
    }

    private async getGroupsByTournament(tournament: Tournament) {
        const groups = await this.groupsRepository.find({
            where: { tournament: tournament }
        })
        if (groups.length === 0) {
            throw new BadRequestException(`There are no groups in this tournament!`)
        }
        return groups;
    }

    private async makeRoundRobinPairings(tournament: Tournament, group: Group, numberOfGames: number) {
        const teams = await this.getTeamsInGroup(group.groupId);
        if (teams.length % 2 == 1) {
            teams.push(null);
        }
        const numberOfTeams = teams.length;
        const rounds = (numberOfTeams - 1) * numberOfGames;
        const half = numberOfTeams / 2;
        const matches = [];
        const indexes = teams.map((_, i) => i).slice(1);
        const startDate = tournament.tournamentStartDate;
        const endDate = startDate;
        const hour = startDate;
        endDate.setHours(tournament.endingHour);
        endDate.setMinutes(tournament.endingMinutes);
        for (let round = 0; round < rounds; round++) {
            const newIndexes = [0].concat(indexes);
            const firstHalf = newIndexes.slice(0, half);
            const secondHalf = newIndexes.slice(half, numberOfTeams).reverse();
            for (let i = 0; i < firstHalf.length; i++) {
                const firstRoster = teams[firstHalf[i]];
                const secondRoster = teams[secondHalf[i]];
                const firstTeam = await this.teamsService.getByParticipatingTeam(firstRoster.participatingTeamId);
                const secondTeam = await this.teamsService.getByParticipatingTeam(secondRoster.participatingTeamId);
                const match = this.matchesRepository.create({
                    matchStartDate: startDate,
                    status: MatchStatus.Scheduled,
                    numberOfMaps: tournament.numberOfMaps,
                    tournament: tournament,
                    group: group,
                    firstRoster: firstRoster,
                    secondRoster: secondRoster,
                    firstTeam: firstTeam,
                    secondTeam: secondTeam,
                    maps: []
                })
                if (hour < endDate) {
                    hour.setHours(hour.getHours() + tournament.numberOfMaps)
                } else {
                    hour.setHours(hour.getDate() + 1)
                    hour.setHours(startDate.getHours());
                    hour.setMinutes(startDate.getMinutes());
                }
                matches.push(match);
            }
            indexes.push(indexes.shift());
        }
        await this.matchesRepository.save(matches);
    }

    private async getTeamsInGroup(groupId: number) {
        const teams = await this.rostersRepository
            .createQueryBuilder(`participatingteam`)
            .innerJoinAndSelect(`participatingteam.team`, `team`)
            .innerJoin(`participatingteam.groups`, `standing`)
            .innerJoin(`standing.group`, `group`)
            .where(`group.groupId = :groupId`, { groupId: groupId })
            .getMany()
        return teams
    }
}