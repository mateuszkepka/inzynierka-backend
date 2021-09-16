import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { ActiveRoster } from "./active-roster.entity";
import { User } from "./user.entity";

@Entity()
export class Player {
    @PrimaryGeneratedColumn()
    playerId: number;

    @Column()
    PUUID: string;

    @Column()
    accountId: string;
    
    @Column()
    summonerId: string;

    @Column()
    region: string;

    @ManyToOne(() => User, (user) => user.players)
    user: User;

    @OneToMany(() => ActiveRoster, (activeRoster) => activeRoster.player)
    activeRosters: ActiveRoster[]

    // TODO: many to many relation with game
    // TODO: many to many relation with team
}