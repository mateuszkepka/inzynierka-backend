import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Player } from "./player.entity";
import { Suspension } from "./suspension.entity";
import { Tournament } from "./tournament.entity";
import { TournamentAdmin } from "./tournament-admin.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ default: `user_name` })
    username: string;

    @Column({ unique: true })
    email: string;
    
    @Column()
    password: string;
    
    @Column({ default: `pl` })
    country: string;
    
    @Column({default: `PJATK` })
    university: string;
    
    @Column({ default: `s1234` })
    studentId: string;

    @OneToMany(() => Tournament, (tournament) => tournament.organizer)
    organizedTournaments: Tournament[];

    @OneToMany(() => Suspension, (suspension) => suspension.user)
    suspensions: Suspension[];

    @OneToMany(() => Player, (player) => player.user)
    players: Player[];
    
    @OneToMany(() => TournamentAdmin, (tournamentAdmin) => tournamentAdmin.tournament)
    tournamentAdmins: TournamentAdmin[];
}