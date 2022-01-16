import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ladder, Tournament } from 'src/database/entities';
import { Repository } from 'typeorm';

@Injectable()
export class LadderSeeder {
    constructor(
        @InjectRepository(Ladder) private readonly ladderRepository: Repository<Ladder>
    ) { }

    async seed(numberOfRows: number, tournaments: Tournament[]) {
        const isSeeded = await this.ladderRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Ladder" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Ladder" table...`);
        const createdLadders = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const ladder: Partial<Ladder> = {
                tournament: tournaments[i],
            };
            const newLadder = await this.ladderRepository.create(ladder);
            createdLadders.push(newLadder);
            await this.ladderRepository.save(newLadder);
        }
        return createdLadders;
    }
}
