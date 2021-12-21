import { Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { Tournament } from "src/entities";
import { TournamentFormat } from "./interfaces/tournament-format-enum";

@Injectable()
export class SchedulingService {
    constructor(private readonly schedulerRegistry: SchedulerRegistry) { }

    async startTournament(tournament: Tournament) {
        const format = tournament.format.name;
        switch (format) {
            case TournamentFormat.SingleRoundRobin:
                // TODO execute proper method
                break;
            case TournamentFormat.DoubleRoundRobin:
                // TODO execute proper method
                break;
            case TournamentFormat.SingleElimLadder:
                // TODO execute proper method
                break;
            case TournamentFormat.DoubleElimLadder:
                // TODO execute proper method
                break;
        }
    }

    private async scheduleGroupDraw(name: string, date: Date) {
        const job = new CronJob(date, () => {
            console.log(`losowanie grup`)
        })

        this.schedulerRegistry.addCronJob(name, job)
        job.start();
    }
}