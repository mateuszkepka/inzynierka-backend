import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
