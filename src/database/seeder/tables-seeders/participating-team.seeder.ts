import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipatingTeam, Player, Team, Tournament } from 'src/database/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { ParticipationStatus } from 'src/modules/teams/dto/participation-status';
import { shuffle } from 'src/utils/tournaments-util';
import { RosterMember } from 'src/modules/tournaments/dto/create-participating-team.dto';
import { InvitationStatus } from 'src/modules/invitations/interfaces/invitation-status.enum';

@Injectable()
export class ParticipatingTeamSeeder {
    constructor(
        @InjectRepository(ParticipatingTeam) private readonly rosterRepository: Repository<ParticipatingTeam>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
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
                        .having(`count("invitation"."invitationId") >= :count`, {
                            count: tournaments[i].numberOfPlayers,
                        })
                        .getQuery();
                    return `team.teamId IN ` + subQuery;
                })
                .getMany();
            teams = shuffle(teams);
            for (let j = 0; j < tournaments[i].numberOfTeams; j++) {
                if (teams[j]) {
                    const members = await this.playersRepository
                        .createQueryBuilder(`player`)
                        .addSelect(`user.userId`)
                        .addSelect(`user.username`)
                        .innerJoinAndSelect(`player.teams`, `invitation`)
                        .innerJoinAndSelect(`invitation.team`, `team`)
                        .innerJoin(`player.user`, `user`)
                        .where(`team.teamId = :id`, { id: teams[j].teamId })
                        .andWhere(`invitation.status = :status`, {
                            status: InvitationStatus.Accepted,
                        })
                        .getMany();
                    const roster = [];
                    for (let k = 0; k < tournaments[i].numberOfPlayers; k++) {
                        const member = new RosterMember();
                        member.playerId = members[k].playerId;
                        member.username = members[k].user.username;
                        roster.push(member);
                    }
                    const participatingTeam = this.rosterRepository.create({
                        tournament: tournaments[i],
                        signDate: faker.datatype.datetime(),
                        team: teams[j],
                        status: ParticipationStatus.CheckedIn,
                        verificationDate: new Date(),
                        checkInDate: new Date(),
                        roster: roster,
                    });
                    createdRosters.push(participatingTeam);
                }
            }
        }
        return this.rosterRepository.save(createdRosters);
    }
}
