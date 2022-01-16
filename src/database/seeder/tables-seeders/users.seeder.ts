import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import * as argon2 from 'argon2';
import { Role } from 'src/roles/roles.enum';

@Injectable()
export class UsersSeeder {
    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

    async seed(numberOfRows: number) {
        const createdUsers = [];

        const adminPassword = await argon2.hash(`admin`, {
            type: argon2.argon2id,
        });
        const admin = this.usersRepository.create({
            email: `admin@admin.com`,
            username: `admin`,
            password: adminPassword,
            country: `Poland`,
            roles: [Role.User, Role.Admin],
        });
        createdUsers.push(admin);

        for (let i = 0; i < 5; i++) {
            const password = await argon2.hash(faker.internet.password(), {
                type: argon2.argon2id,
            });
            const organizer = this.usersRepository.create({
                email: faker.internet.email(),
                username: faker.internet.userName(),
                password: password,
                country: `Poland`,
                roles: [Role.User, Role.Organizer],
            });
            createdUsers.push(organizer);
        }

        for (let i = 0; i < numberOfRows; i++) {
            const password = await argon2.hash(faker.internet.password(), {
                type: argon2.argon2id,
            });
            const user = this.usersRepository.create({
                email: faker.internet.email(),
                username: faker.internet.userName(),
                password: password,
                country: `Poland`,
            });
            createdUsers.push(user);
        }
        return this.usersRepository.save(createdUsers);
    }
}
