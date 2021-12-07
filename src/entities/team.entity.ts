import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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
    @Column({ unique: true })
    name: string;

    @Expose()
    @Column()
    creationDate: Date;

    @Expose()
    @ManyToOne(() => Player, (player) => player.ownedTeams)
    @JoinColumn({ name: `captainId` })
    captain: Player;

    @OneToMany(() => ParticipatingTeam, (roster) => roster.team)
    rosters: ParticipatingTeam[];

    @Expose()
    @OneToMany(() => Invitation, (invitation) => invitation.team, { onDelete: `CASCADE` })
    members: Invitation[];
}
