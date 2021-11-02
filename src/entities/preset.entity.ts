import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Tournament } from './tournament.entity';

@Entity()
export class Preset {
    @PrimaryGeneratedColumn()
    presetId: number;

    @Column()
    mapName: string;

    @Column()
    pickRules: string;

    @Column()
    spectatorRules: string;
}
