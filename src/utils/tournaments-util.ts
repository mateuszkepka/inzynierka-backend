import { Tournament } from "../database/entities/tournament.entity";

export function getRandom(weights: number[], results: number[]) {
    let num = Math.random(),
        s = 0,
        lastIndex = weights.length - 1;
    for (let i = 0; i < lastIndex; ++i) {
        s += weights[i];
        if (num < s) {
            return results[i];
        }
    }
    return results[lastIndex];
}

export function shuffle(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function setNextPhaseDate(date: Date, tournament: Tournament): Date {
    const startDate = new Date(tournament.tournamentStartDate);
    const endDate = new Date(tournament.tournamentStartDate);
    if (date.getUTCDate() > endDate.getUTCDate()) {
        endDate.setUTCDate(date.getTime());
    }
    endDate.setUTCHours(tournament.endingHour);
    endDate.setUTCMinutes(tournament.endingMinutes);
    let newDay = false;
    if (((date > endDate || date.getTime() === endDate.getTime()) &&
        date.getUTCDate() === endDate.getUTCDate()) || (date < startDate)) {
        newDay = true;
        startDate.setUTCDate(startDate.getUTCDate() + 1);
        date = new Date(startDate);
    }
    if (date < endDate && !newDay) {
        date.setUTCHours(date.getUTCHours() + tournament.numberOfMaps)
    }
    return date;
}