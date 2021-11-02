import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { Team } from "./team.entity";
import { Player } from "./player.entity";

@Entity()
export class PlayerTeam {
    @ManyToOne(() => Team, (team) => team.playerTeams, { primary: true })
    @JoinColumn({ name: "teamId" })
    team: Team

    @ManyToOne(() => Player, (player) => player.playerTeams, { primary: true })
    @JoinColumn({ name: "playerId" })
    player: Player
}