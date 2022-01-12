import { Expose, Transform } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Map } from './map.entity';
import { User } from './user.entity';

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

    @Expose({ name: `username` })
    @Transform(
        ({ value }) => {
            if (value !== undefined) {
                return value.username;
            } else {
                return;
            }
        },
        { toPlainOnly: true },
    )
    @ManyToOne(() => User, (user) => user.performances)
    @JoinColumn({ name: `userId` })
    user: User;

    @Expose()
    @ManyToOne(() => Map, (map) => map.performances)
    @JoinColumn({ name: `mapId` })
    map: Map;
}
