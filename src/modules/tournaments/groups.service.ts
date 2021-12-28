import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Group, ParticipatingTeam, Team, Tournament } from "src/entities";
import { Repository } from "typeorm";
import { StandingsDto } from "./dto/standings-dto";

@Injectable()
export class GroupsService {
    constructor(
        @InjectRepository(Group) private readonly groupsRepository: Repository<Group>
    ) { }

    async drawGroups(tournament: Tournament, teams: ParticipatingTeam[]) {
        teams = this.shuffle(teams);
        for (let i = 0; i < tournament.numberOfGroups; i++) {
            const standing: StandingsDto[] = [];
            await this.groupsRepository.save({
                name: String.fromCharCode(i + 65),
                tournament: tournament,
                standings: standing
            });
        }
        const groups = await this.getGroupsByTournament(tournament);
        groups.forEach(async (group) => {
            if (teams.length > 0) {
                await this.addTeam(group, teams.pop().team)
            }
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

    async addTeam(group: Group, team: Team) {
        const standing = new StandingsDto();
        standing.teamId = team.teamId;
        standing.teamName = team.teamName;
        standing.points = 0;
        standing.place = 0;
        group.standings.push(standing);
        return this.groupsRepository.save(group);
    }

    shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}