import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Group, GroupStanding, Match, ParticipatingTeam, Tournament } from "src/database/entities";
import { setNextPhaseDate, shuffle } from "src/utils/tournaments-util";
import { Repository } from "typeorm";
import { MatchStatus } from "../matches/interfaces/match-status.enum";

@Injectable()
export class GroupsService {
    constructor(
        @InjectRepository(ParticipatingTeam) private readonly rostersRepository: Repository<ParticipatingTeam>,
        @InjectRepository(GroupStanding) private readonly standingsRepository: Repository<GroupStanding>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(Group) private readonly groupsRepository: Repository<Group>,
    ) { }

    async drawGroups(
        tournament: Tournament,
        participatingTeams: ParticipatingTeam[],
        numberOfGames: number
    ) {
        participatingTeams = shuffle(participatingTeams);

        const groups: Group[] = [];
        for (let i = 0; i < tournament.numberOfGroups; i++) {
            const group = await this.groupsRepository.save({
                name: String.fromCharCode(i + 65),
                tournament: tournament,
            });
            groups.push(group);
        }

        for (let i = 0; i < participatingTeams.length; i++) {
            const roster = participatingTeams[i];
            const groupNumber = i % groups.length;
            await this.standingsRepository.save({
                place: 0,
                points: 0,
                group: groups[groupNumber],
                team: roster.team,
                roster: roster,
            });
        }

        groups.forEach(async (group) => {
            await this.makeRoundRobinPairings(tournament, group, numberOfGames);
        });
    }

    private async makeRoundRobinPairings(
        tournament: Tournament,
        group: Group,
        numberOfGames: number
    ) {
        const teams = await this.getTeamsInGroup(group.groupId);
        if (teams.length % 2 == 1) {
            teams.push(null);
        }
        const numberOfTeams = teams.length;
        const rounds = (numberOfTeams - 1) * numberOfGames;
        const half = numberOfTeams / 2;
        const matches = [];
        const indexes = teams.map((_, i) => i).slice(1);
        const startDate = new Date(tournament.tournamentStartDate);
        let hour = new Date(startDate);
        for (let round = 0; round < rounds; round++) {
            const newIndexes = [0].concat(indexes);
            const firstHalf = newIndexes.slice(0, half);
            const secondHalf = newIndexes.slice(half, numberOfTeams).reverse();
            for (let i = 0; i < firstHalf.length; i++) {
                let firstRoster = teams[firstHalf[i]];
                let secondRoster = teams[secondHalf[i]];
                let firstTeam = null;
                let secondTeam = null;
                if (firstRoster !== null) {
                    firstTeam = firstRoster.team;
                }
                if (secondRoster !== null) {
                    secondTeam = secondRoster.team;
                }
                const match = this.matchesRepository.create({
                    matchStartDate: new Date(hour),
                    status: MatchStatus.Scheduled,
                    numberOfMaps: tournament.numberOfMaps,
                    tournament: tournament,
                    group: group,
                    firstRoster: firstRoster,
                    secondRoster: secondRoster,
                    firstTeam: firstTeam,
                    secondTeam: secondTeam,
                    maps: [],
                });
                hour = setNextPhaseDate(hour, tournament);
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
            .getMany();
        return teams;
    }
}
