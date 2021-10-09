import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveRoster, Player, Roster } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ActiveRosterSeeder {
    constructor(
        @InjectRepository(ActiveRoster)
        private readonly activeRosterRepository: Repository<ActiveRoster>,
    ) {}

    async seed(numberOfRows: number, players: Player[], rosters: Roster[]) {
        const isSeeded = await this.activeRosterRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"ActiveRoster" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "ActiveRoster" table...`);
        const createdActiveRosters = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const activeRoster: Partial<ActiveRoster> = {
                player: players[i],
                roster: rosters[i],
            };
            const newActiveRoster = await this.activeRosterRepository.create(activeRoster);
            createdActiveRosters.push(newActiveRoster);
            await this.activeRosterRepository.save(newActiveRoster);
        }
        return createdActiveRosters;
    }
}
