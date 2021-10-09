import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class UsersSeeder {
    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.usersRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Users" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Users" table...`);
        const createdUsers = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const user: Partial<User> = {
                email: faker.internet.email(),
                username: faker.internet.userName(),
                password: faker.internet.password(),
                country: faker.address.country(),
                university: faker.company.companyName(),
                studentId: faker.datatype.uuid(),
            };
            const newUser = await this.usersRepository.create(user);
            createdUsers.push(newUser);
            await this.usersRepository.save(newUser);
        }
        return createdUsers;
    }
}
