import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, Format, Prize, Tournament, User } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { getRandom } from 'src/utils/tournaments-util';
import { Role } from 'src/roles/roles.enum';
import { TournamentFormat } from 'src/modules/formats/dto/tournament-format.enum';
import { TournamentStatus } from 'src/modules/tournaments/dto/tourrnament.status.enum';

@Injectable()
export class TournamentsSeeder {
    constructor(
        @InjectRepository(Tournament)
        private readonly tournamentsRepository: Repository<Tournament>,
    ) {}

    async seed(
        numberOfRows: number,
        prizes: Prize[],
        formats: Format[],
        users: User[],
        game: Game,
    ) {
        const createdTournaments = [];
        const organizers = users.filter((user) => user.roles.includes(Role.Organizer));
        for (let i = 0; i < numberOfRows; i++) {
            const numberOfPlayers = getRandom([0.15, 0.15, 0.05, 0.05, 0.6], [1, 2, 3, 4, 5]);
            const numberOfTeams = getRandom([0.3, 0.2, 0.2, 0.3], [8, 16, 32, 64]);
            const format = formats[Math.floor(Math.random() * formats.length)];
            let numberOfGroups = null;
            if (
                format.name === TournamentFormat.SingleRoundRobin ||
                format.name === TournamentFormat.DoubleRoundRobin
            ) {
                numberOfGroups = getRandom([0.1, 0.3, 0.6], [1, 2, 4]);
            }
            const numberOfMaps = getRandom([0.7, 0.2, 0.1], [1, 3, 5]);
            const registerStartRandom = faker.date.soon(1);
            registerStartRandom.setMinutes(getRandom([0.25, 0.25, 0.25, 0.25], [0, 15, 30, 45]));
            registerStartRandom.setSeconds(0);
            registerStartRandom.setMilliseconds(0);
            const registerStartDate = new Date(registerStartRandom);
            const registerEndRandom = registerStartRandom;
            registerEndRandom.setDate(registerEndRandom.getDate() + 1);
            registerEndRandom.setHours(getRandom([0.2, 0.2, 0.2, 0.2, 0.2], [14, 15, 16, 17, 18]));
            registerEndRandom.setMinutes(getRandom([0.25, 0.25, 0.25, 0.25], [0, 15, 30, 45]));
            registerEndRandom.setSeconds(0);
            registerEndRandom.setMilliseconds(0);
            const registerEndDate = new Date(registerEndRandom);
            const tournamentStartDate = new Date(
                registerEndRandom.setHours(registerEndRandom.getHours() + Math.random() * 4 + 1),
            );
            const endingHour = getRandom([0.5, 0.5], [22, 23]);
            const endingMinutes = getRandom([0.5, 0.5], [0, 30]);
            const tournament = this.tournamentsRepository.create({
                name: faker.internet.userName(),
                numberOfPlayers: numberOfPlayers,
                numberOfTeams: numberOfTeams,
                numberOfGroups: numberOfGroups,
                numberOfMaps: numberOfMaps,
                registerStartDate: registerStartDate,
                registerEndDate: registerEndDate,
                tournamentStartDate: tournamentStartDate,
                endingHour: endingHour,
                endingMinutes: endingMinutes,
                status: TournamentStatus.Upcoming,
                description: faker.lorem.sentences(5),
                prize: prizes[Math.floor(Math.random() * prizes.length)],
                format: format,
                organizer: organizers[Math.floor(Math.random() * organizers.length)],
                game: game,
            });
            createdTournaments.push(tournament);
        }

        return this.tournamentsRepository.save(createdTournaments);
    }
}
