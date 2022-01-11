import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Suspension, User } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class SuspensionsSeeder {
    constructor(@InjectRepository(Suspension) private readonly suspensionsRepository: Repository<Suspension>,) { }

    async seed(users: User[]) {
        const createdSuspensions = [];
        for (let i = 0; i < users.length; ++i) {
            const admin = users.find((user) => user.username === `admin`);
            const ifBanned = Math.random() < 0.1 ? true : false;
            if (ifBanned) {
                const suspension = this.suspensionsRepository.create({
                    endDate: faker.date.soon(10),
                    reason: faker.lorem.sentences(2),
                    user: users[i],
                    admin: admin
                });
                createdSuspensions.push(suspension);
            }
        }
        return this.suspensionsRepository.save(createdSuspensions);
    }
}
