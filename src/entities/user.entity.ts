import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Player } from "./player.entity";
import { Suspension } from "./suspension.enitity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column()
    username: string;

    @Column()
    email: string;
    
    @Column()
    password: string;
    
    @Column()
    country: string;
    
    @Column()
    university: string;
    
    @Column()
    studentId: string;

    @OneToMany(() => Suspension, (suspension) => suspension.user)
    suspensions: Suspension[];

    @OneToMany(() => Player, (player) => player.user)
    players: Player[];
}