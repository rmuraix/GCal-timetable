export class Cal {
  private readonly calendar: GoogleAppsScript.Calendar.Calendar;
  constructor(id: string) {
    this.calendar = CalendarApp.getCalendarById(id);
  }
  isAlldayEvent(event: GoogleAppsScript.Calendar.CalendarEvent): boolean {
    return event.isAllDayEvent();
  }
  getEventsForDay(date: Date) {
    const events = this.calendar.getEventsForDay(date);
    if (events[0]) {
      return events[0];
    } else {
      return null;
    }
  }
  getEvents(startTime: Date, endTime: Date) {
    return this.calendar.getEvents(startTime, endTime);
  }
  createEvent(
    title: string,
    startTime: Date,
    endTime: Date,
    description: string,
  ) {
    const options = { description: description };
    this.calendar.createEvent(title, startTime, endTime, options);
  }
  deleteEvent(event: GoogleAppsScript.Calendar.CalendarEvent) {
    event.deleteEvent();
  }
}
