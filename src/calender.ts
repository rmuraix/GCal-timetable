export class Cal {
    readonly calendar: GoogleAppsScript.Calendar.Calendar;
    constructor(id: string) {
        this.calendar = CalendarApp.getCalendarById(id);
    }
    getEvent() {

    }
    getAllDayEvent(date: Date) {
        const events = this.calendar.getEventsForDay(date);
        return events[0];
    }

}