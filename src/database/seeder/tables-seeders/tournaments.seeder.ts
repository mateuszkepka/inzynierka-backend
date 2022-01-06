import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, Format, Prize, Tournament, User } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { getRandom } from 'src/util';
import { Role } from 'src/roles/roles.enum';
import { TournamentFormat } from 'src/modules/formats/dto/tournament-format-enum';

@Injectable()
export class TournamentsSeeder {
    constructor(
        @InjectRepository(Tournament) private readonly tournamentsRepository: Repository<Tournament>,
    ) { }

    async seed(numberOfRows: number, prizes: Prize[], formats: Format[], users: User[], game: Game,) {
        const createdTournaments = [];
        const organizers = users.filter((user) => user.roles.includes(Role.Organizer));
        for (let i = 0; i < numberOfRows; i++) {
            const numberOfPlayers = getRandom([0.15, 0.15, 0.05, 0.05, 0.6], [1, 2, 3, 4, 5]);
            const numberOfTeams = getRandom([0.1, 0.2, 0.2, 0.2, 0.3], [4, 8, 16, 32, 64]);
            const format = formats[Math.floor(Math.random() * formats.length)];
            let numberOfGroups = null;
            if (format.name === TournamentFormat.SingleRoundRobin || format.name === TournamentFormat.DoubleRoundRobin) {
                
            }
            const numberOfMaps = getRandom([0.7, 0.2, 0.1], [1, 3, 5]);
            const registerStartDate = faker.datatype.datetime();
            const tournamentStartDate = faker.datatype.datetime();
            const tournament = this.tournamentsRepository.create({
                name: faker.internet.userName(),
                numberOfPlayers: numberOfPlayers,
                numberOfTeams: numberOfTeams,
                numberOfGroups: numberOfGroups,
                numberOfMaps: numberOfMaps,
                registerStartDate: registerStartDate,
                registerEndDate: faker.date.future(0, registerStartDate),
                tournamentStartDate: tournamentStartDate,
                endingHour: 22,
                endingMinutes: 0,
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
