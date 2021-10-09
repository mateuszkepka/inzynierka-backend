import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roster, Team } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class RosterSeeder {
    constructor(@InjectRepository(Roster) private readonly rosterRepository: Repository<Roster>) {}

    async seed(numberOfRows: number, teams: Team[]) {
        const isSeeded = await this.rosterRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Roster" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Roster" table...`);
        const createdRosters = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const roster: Partial<Roster> = {
                signDate: faker.datatype.datetime(),
                isRegistered: true,
                team: teams[i],
            };
            const newRoster = await this.rosterRepository.create(roster);
            createdRosters.push(newRoster);
            await this.rosterRepository.save(newRoster);
        }
        return createdRosters;
    }
}
