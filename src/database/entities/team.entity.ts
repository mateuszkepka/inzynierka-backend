import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, Transform } from 'class-transformer';
import { ParticipatingTeam } from './participating-team.entity';
import { Player } from './player.entity';
import { Game, Invitation } from '.';
import { RegionsLoL } from 'src/modules/games/interfaces/regions';

@Entity()
export class Team {
    @BeforeInsert()
    setCreationDate() {
        this.creationDate = new Date();
    }

    @Expose()
    @PrimaryGeneratedColumn()
    teamId: number;

    @Expose()
    @Column({ nullable: true, unique: true })
    teamName: string;

    @Expose()
    @Column()
    creationDate: Date;

    @Expose()
    @Column({
        type: `enum`,
        enum: RegionsLoL,
        default: null,
        nullable: true,
    })
    region: RegionsLoL;

    @Expose({ name: `gameId` })
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.gameId;
        } else {
            return;
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Game)
    @JoinColumn({ name: `gameId` })
    game: Game;

    @Expose({ name: `captainId` })
    @ManyToOne(() => Player, (player) => player.ownedTeams)
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.playerId;
        } else {
            return;
        }
    }, { toPlainOnly: true })
    @JoinColumn({ name: `captainId` })
    captain: Player;

    @Expose()
    @OneToMany(() => ParticipatingTeam, (roster) => roster.team)
    rosters: ParticipatingTeam[];

    @OneToMany(() => Invitation, (invitation) => invitation.team)
    members: Invitation[];

    @Expose()
    @Column({ default: 'default-team-avatar.png' })
    profilePicture: string;

    @Expose()
    @Column({ default: 'default-team-background.png' })
    backgroundPicture: string;
}
