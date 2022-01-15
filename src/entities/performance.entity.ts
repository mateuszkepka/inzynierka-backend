import { Expose, Transform } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Map } from './map.entity';
import { Player } from './player.entity';

@Entity()
export class Performance {
    @PrimaryGeneratedColumn()
    performanceId: number;

    @Expose()
    @Column()
    kills: number;

    @Expose()
    @Column()
    deaths: number;

    @Expose()
    @Column()
    assists: number;

    @Expose({ name: `playerId` })
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.playerId;
        } else {
            return
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Player, (player) => player.performances)
    @JoinColumn({ name: `playerId` })
    player: Player;

    @Expose()
    @ManyToOne(() => Map, (map) => map.performances)
    @JoinColumn({ name: `mapId` })
    map: Map;
}
