import { Tournament } from "./entities/tournament.entity";

export function getRandom(weights: number[], results: number[]) {
    var num = Math.random(),
        s = 0,
        lastIndex = weights.length - 1;

    for (var i = 0; i < lastIndex; ++i) {
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
    if (date.getDate() > endDate.getDate()) {
        endDate.setDate(date.getDate());
    }
    endDate.setHours(tournament.endingHour);
    endDate.setMinutes(tournament.endingMinutes);
    let newDay = false;
    if (((date > endDate || date.getTime() === endDate.getTime()) && date.getDate() === endDate.getDate()) || (date < startDate)) {
        newDay = true;
        startDate.setDate(date.getDate());
        startDate.setDate(startDate.getDate() + 1);
        date = new Date(startDate);
    }
    if (date < endDate && !newDay) {
        date.setHours(date.getHours() + tournament.numberOfMaps)
    }
    return date;
}