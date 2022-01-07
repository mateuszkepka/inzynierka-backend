import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipatingTeam, Team, Tournament } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { ParticipationStatus } from 'src/modules/teams/dto/participation-status';
import { shuffle } from 'src/util';
import { RosterMember } from 'src/modules/tournaments/dto/create-participating-team.dto';

@Injectable()
export class ParticipatingTeamSeeder {
    constructor(
        @InjectRepository(ParticipatingTeam) private readonly rosterRepository: Repository<ParticipatingTeam>,
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>
    ) { }

    async seed(tournaments: Tournament[]) {
        const createdRosters = [];

        for (let i = 0; i < tournaments.length; i++) {
            let teams = await this.teamsRepository
                .createQueryBuilder(`team`)
                .leftJoinAndSelect(`team.members`, `invitation`)
                .innerJoinAndSelect(`invitation.player`, `player`)
                .where((qb) => {
                    const subQuery = qb
                        .subQuery()
                        .select(`team.teamId`)
                        .from(Team, `team`)
                        .innerJoin(`team.members`, `invitation`)
                        .groupBy(`team.teamId`)
                        .having(`count("invitation"."invitationId") >= :count`, { count: tournaments[i].numberOfPlayers })
                        .getQuery()
                    return `team.teamId IN ` + subQuery
                }).getMany();
            teams = shuffle(teams);
            for (let j = 0; j < tournaments[i].numberOfTeams; j++) {
                if (teams[j]) {
                    const roster = [];
                    const subs = [];
                    for (let k = 0; k < tournaments[i].numberOfPlayers; k++) {
                        const member = new RosterMember();
                        member.playerId = Math.floor(Math.random() * 50 + 1);
                        member.username = faker.internet.userName();
                        roster.push(member)
                    }
                    const sub = new RosterMember();
                    sub.playerId = Math.floor(Math.random() * 50 + 1);
                    sub.username = faker.internet.userName();
                    subs.push(sub);
                    const participatingTeam = this.rosterRepository.create({
                        tournament: tournaments[i],
                        signDate: faker.datatype.datetime(),
                        team: teams[j],
                        status: ParticipationStatus.CheckedIn,
                        verificationDate: new Date(),
                        checkInDate: new Date(),
                        roster: roster,
                        subs: subs
                    });
                    createdRosters.push(participatingTeam);
                }
            }
        }
        return this.rosterRepository.save(createdRosters);
    }
}
