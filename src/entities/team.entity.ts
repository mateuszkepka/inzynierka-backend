<<<<<<< HEAD
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, Transform, Type } from 'class-transformer';
=======
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Expose } from 'class-transformer';
>>>>>>> d0fb705d834e31ffd267bd7d5c6c4bcc91276d6a
import { ParticipatingTeam } from './participating-team.entity';
import { Player } from './player.entity';
import { Invitation } from '.';

@Entity()
export class Team {
    @BeforeInsert()
    setCreationDate() {
        this.creationDate = new Date()
    }

    @Expose()
    @PrimaryGeneratedColumn()
    teamId: number;

    @Expose()
    @Column({ unique: true })
    teamName: string;

    @Expose()
    @Column()
    creationDate: Date;

    @Expose()
    @ManyToOne(() => Player, (player) => player.ownedTeams)
    @JoinColumn({ name: `captainId` })
    captain: Player;

    @OneToMany(() => ParticipatingTeam, (roster) => roster.team)
    rosters: ParticipatingTeam[];

    @OneToMany(() => Invitation, (invitation) => invitation.team, { onDelete: `CASCADE` })
    members: Invitation[];
}
