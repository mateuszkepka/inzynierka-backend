import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, Format, Prize, Tournament, User } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class TournamentsSeeder {
    constructor(
        @InjectRepository(Tournament)
        private readonly tournamentsRepository: Repository<Tournament>,
    ) {}

    async seed(
        numberOfRows: number,
        prizes: Prize[],
        presets: Format[],
        users: User[],
        game: Game,
    ) {
        const isSeeded = await this.tournamentsRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Tournament" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Tournament" table...`);
        const createdTournaments = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const registerStartDate = faker.datatype.datetime();
            const tournamentStartDate = faker.datatype.datetime();
            const tournament: Partial<Tournament> = {
                name: faker.internet.userName(),
                numberOfPlayers: faker.datatype.number(),
                numberOfTeams: faker.datatype.number(),
                registerStartDate: registerStartDate,
                registerEndDate: faker.date.future(0, registerStartDate),
                tournamentStartDate: tournamentStartDate,
                //tournamentEndDate: faker.date.future(0, tournamentStartDate),
                description: faker.lorem.sentences(5),
                prize: prizes[i],
                format: presets[i],
                organizer: users[i],
                game: game,
            };
            const newTournament = await this.tournamentsRepository.create(tournament);
            createdTournaments.push(newTournament);
            await this.tournamentsRepository.save(newTournament);
        }

        return createdTournaments;
    }
}
