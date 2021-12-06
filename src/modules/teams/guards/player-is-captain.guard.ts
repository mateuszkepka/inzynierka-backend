import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { User } from "src/entities";

@Injectable()
export class TeamCaptain implements CanActivate {
    constructor() { }
    canActivate(context: ExecutionContext) {
        // TODO
        return true;
    }
}