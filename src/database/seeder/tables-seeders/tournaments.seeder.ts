import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Preset, Tournament, User } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class TournamentsSeeder {
    constructor(
        @InjectRepository(Tournament)
        private readonly tournamentsRepository: Repository<Tournament>,
    ) {}

    async seed(numberOfRows: number, presets: Preset[], users: User[]) {
        const isSeeded = await this.tournamentsRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Tournament" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Tournament" table...`);
        const createdTournaments = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const tournament: Partial<Tournament> = {
                name: faker.internet.userName(),
                numberOfPlayers: faker.datatype.number(),
                numberOfTeams: faker.datatype.number(),
                registerStartDate: faker.datatype.datetime(),
                registerEndDate: faker.datatype.datetime(),
                tournamentStartDate: faker.datatype.datetime(),
                tournamentEndDate: faker.datatype.datetime(),
                description: faker.lorem.sentences(5),
                preset: presets[i],
                organizer: users[i],
            };
            const newTournament = await this.tournamentsRepository.create(tournament);
            createdTournaments.push(newTournament);
            await this.tournamentsRepository.save(newTournament);
        }

        return createdTournaments;
    }
}
