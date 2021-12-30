import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Group, GroupStanding, Match, ParticipatingTeam, Team, Tournament } from "src/entities";
import { Repository } from "typeorm";
import { TournamentFormat } from "../formats/dto/tournament-format-enum";
import { MatchStatus } from "../matches/interfaces/match-status.enum";

@Injectable()
export class GroupsService {
    constructor(
        @InjectRepository(ParticipatingTeam) private readonly rostersRepository: Repository<ParticipatingTeam>,
        @InjectRepository(GroupStanding) private readonly standingsRepository: Repository<GroupStanding>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(Group) private readonly groupsRepository: Repository<Group>,
    ) { }

    async drawGroups(tournament: Tournament, teams: ParticipatingTeam[]) {
        // shuffling teams array
        teams = this.shuffle(teams);

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
                await this.standingsRepository.save({
                    place: 0,
                    points: 0,
                    group: group,
                    team: teams.pop()
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

    async getGroupsByTournament(tournament: Tournament) {
        const groups = await this.groupsRepository.find({
            where: { tournament: tournament }
        })
        if (groups.length === 0) {
            throw new BadRequestException(`There are no groups in this tournament!`)
        }
        return groups;
    }

    async getById(groupId: number) {
        const group = await this.groupsRepository.findOne({ where: { groupId: groupId } });
        if (!group) {
            throw new NotFoundException(`Group with given id doest not exist!`);
        }
        return group;
    }

    async getTeamsInGroup(groupId: number) {
        const teams = await this.rostersRepository
            .createQueryBuilder(`participatingteam`)
            .innerJoinAndSelect(`participatingteam.team`, `team`)
            .innerJoin(`participatingteam.groups`, `standing`)
            .innerJoin(`standing.group`, `group`)
            .where(`group.groupId = :groupId`, { groupId: groupId })
            .getMany()
        return teams
    }

    async makeRoundRobinPairings(tournament: Tournament, group: Group, numberOfGames: number) {
        const teams = await this.getTeamsInGroup(group.groupId);
        if (teams.length % 2 == 1) {
            teams.push(null);
        }
        const numberOfTeams = teams.length;
        const rounds = (numberOfTeams - 1) * numberOfGames;
        const half = numberOfTeams / 2;
        const matches = [];
        const indexes = teams.map((_, i) => i).slice(1);
        for (let round = 0; round < rounds; round++) {
            const newIndexes = [0].concat(indexes);
            const firstHalf = newIndexes.slice(0, half);
            const secondHalf = newIndexes.slice(half, numberOfTeams).reverse();
            const startDate = tournament.tournamentStartDate;
            const endDate = startDate.setHours(startDate.getHours() + 1);
            for (let i = 0; i < firstHalf.length; i++) {
                const match = this.matchesRepository.create({
                    matchStartDate: startDate,
                    matchEndDate: endDate,
                    status: MatchStatus.Scheduled,
                    numberOfMaps: 1,
                    tournament: tournament,
                    group: group,
                    firstRoster: teams[firstHalf[i]],
                    secondRoster: teams[secondHalf[i]],
                    maps: []
                })
                //console.log(`MATCH BETWEEN ${match.firstRoster.team.teamName} AND ${match.secondRoster.team.teamName} SCHEDULED FOR ${match.matchStartDate.toLocaleString()}`)
                matches.push(match);
            }
            indexes.push(indexes.shift());
        }
        return this.matchesRepository.save(matches);
    }

    shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}