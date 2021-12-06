import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Expose } from 'class-transformer';
import { ParticipatingTeam } from './participating-team.entity';
import { Player } from './player.entity';
import { Invitation } from '.';

@Entity()
export class Team {
    @Expose()
    @PrimaryGeneratedColumn()
    teamId: number;

    @Expose()
    @Column()
    name: string;

    @Expose()
    @Column()
    creationDate: Date;

    @Expose()
    @OneToOne(() => Player, (player) => player.ownedTeams) 
    @JoinColumn({ name: `captainId` })
    captain: Player;

    @OneToMany(() => ParticipatingTeam, (roster) => roster.team)
    rosters: ParticipatingTeam[];

    @Expose()
    @OneToMany(() => Invitation, (invitation) => invitation.team)
    members: Invitation[];
}
