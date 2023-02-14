export class Cal {
    private readonly calendar: GoogleAppsScript.Calendar.Calendar;
    constructor(id: string) {
        this.calendar = CalendarApp.getCalendarById(id);
    }
    getEvent() {

    }
    getAllDayEvent(date: Date) {
        const events = this.calendar.getEventsForDay(date);
        return events[0];
    }
    createEvent(title: string, startTime: Date, endTime: Date, description: string) {
        const options = { description: description };
        this.calendar.createEvent(title, startTime, endTime, options);
    }
}