// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import * as faker from 'faker';
// import { Group, Tournament } from 'src/entities';

// @Injectable()
// export class GroupsSeeder {
//     constructor(@InjectRepository(Group) private readonly groupsRepository: Repository<Group>) {}

//     async seed(numberOfRows: number, tournaments: Tournament[]) {
//         const isSeeded = await this.groupsRepository.findOne();

//         if (isSeeded) {
//             // TODO: add logger
//             console.log(`"Group" table seems to be seeded...`);
//             return;
//         }

//         console.log(`Seeding "Group" table...`);
//         const createdGroups = [];

//         for (let i = 0; i < numberOfRows; ++i) {
//             const group: Partial<Group> = {
//                 numberOfTeams: faker.datatype.number(),
//                 numberOfQualifying: faker.datatype.number(),
//                 tournament: tournaments[i],
//             };
//             const newGroup = await this.groupsRepository.create(group);
//             createdGroups.push(newGroup);
//             await this.groupsRepository.save(newGroup);
//         }
//         return createdGroups;
//     }
// }
