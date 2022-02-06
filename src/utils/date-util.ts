export function adjustTimeZone(dateInMilis: number, response?: boolean): Date {
    const date = new Date(dateInMilis);
    let offset = date.getTimezoneOffset() * 60 * 1000;
    if (response) {
        if (offset > 0) {
            return new Date(date.getTime() + offset);
        } else if (offset < 0) {
            return new Date(date.getTime() - offset);
        } else {
            return date;
        }
    }
    if (offset > 0) {
        return new Date(date.getTime() - offset);
    } else if (offset < 0) {
        return new Date(date.getTime() + offset);
    } else {
        return date;
    }
}