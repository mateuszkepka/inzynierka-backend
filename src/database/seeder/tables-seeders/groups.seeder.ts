import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { Group } from 'src/entities';

@Injectable()
export class GroupsSeeder {
    constructor(@InjectRepository(Group) private readonly groupsRepository: Repository<Group>) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.groupsRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Group" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Group" table...`);

        for (let i = 0; i < numberOfRows; ++i) {
            const group: Partial<Group> = {
                numberOfTeams: faker.datatype.number(),
                numberOfQualifying: faker.datatype.number(),
            };
            const newGroup = await this.groupsRepository.create(group);
            await this.groupsRepository.save(newGroup);
        }
    }
}
