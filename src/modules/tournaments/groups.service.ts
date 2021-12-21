import { Injectable } from "@nestjs/common";
import { ParticipatingTeam } from "src/entities";

@Injectable()
export class GroupsService {
    constructor() { }

    async drawGroups(teams: ParticipatingTeam[]) {

    }
}