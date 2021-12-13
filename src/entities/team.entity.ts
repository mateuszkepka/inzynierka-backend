import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, Transform } from 'class-transformer';
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

    @ManyToOne(() => Player, (player) => player.ownedTeams)
    @JoinColumn({ name: `captainId` })
    captain: Player;

    @OneToMany(() => ParticipatingTeam, (roster) => roster.team)
    rosters: ParticipatingTeam[];

    @Expose()
    @OneToMany(() => Invitation, (invitation) => invitation.team, { onDelete: `CASCADE` })
    members: Invitation[];
}
