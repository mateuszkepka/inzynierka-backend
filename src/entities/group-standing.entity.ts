import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ParticipatingTeam } from '.';

import { Group } from './group.entity';

@Entity()
export class GroupStanding {
    @PrimaryGeneratedColumn()
    groupStandingId: number;

    @Expose()
    @Column()
    place: number;

    @Expose()
    @Column()
    points: number;

    @Expose()
    @ManyToOne(() => Group)
    @JoinColumn({ name: `groupId` })
    group: Group;

    @Expose()
    @ManyToOne(() => ParticipatingTeam)
    @JoinColumn({ name: `rosterId` })
    roster: ParticipatingTeam;
}