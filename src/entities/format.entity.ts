import { Expose } from 'class-transformer';
import { TournamentFormat } from 'src/modules/formats/dto/tournament-format.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Format {
    @Expose()
    @PrimaryGeneratedColumn()
    formatId: number;

    @Expose()
    @Column({
        type: `enum`,
        enum: TournamentFormat,
        nullable: false,
    })
    name: string;

    @Expose()
    @Column()
    description: string;
}
