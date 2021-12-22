import { Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { Tournament } from "src/entities";
import { TournamentFormat } from "../formats/dto/tournament-format-enum";

@Injectable()
export class SchedulingService {
    constructor(private readonly schedulerRegistry: SchedulerRegistry) { }

    async startTournament(tournament: Tournament) {
        const format = tournament.format.name;
        console.log(format)
        switch (format) {
            case TournamentFormat.SingleRoundRobin:
                let date = new Date();
                let newDate = new Date();
                newDate.setMinutes(date.getSeconds() + 30);
                console.log(newDate);
                this.scheduleGroupDraw(`test`, newDate)
                break;
            case TournamentFormat.DoubleRoundRobin:
                // TODO execute proper method
                break;
            case TournamentFormat.SingleEliminationLadder:
                // TODO execute proper method
                break;
            case TournamentFormat.DoubleEliminationLadder:
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