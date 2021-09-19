import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

    async getById(userId: number) {
        const user = await this.usersRepository.findOne({ userId });
        if (user) {
            return user;
        }
        throw new NotFoundException(`User with this email does not exist`);
    }

    async getByEmail(email: string) {
        const user = await this.usersRepository.findOne({ email });
        if (user) {
            return user;
        }
        throw new NotFoundException(`User with this email does not exist`);
    }

    async create(user: CreateUserDto) {
        const newUser = await this.usersRepository.create(user);
        await this.usersRepository.save(newUser);
        return newUser;
    }
}