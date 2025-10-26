import { BatchService } from "./batchService";

export class Cal {
	private readonly calendar: GoogleAppsScript.Calendar.Calendar;
	private readonly calendarId: string;
	private batchService: BatchService | null = null;

	constructor(id: string) {
		this.calendarId = id;
		this.calendar = CalendarApp.getCalendarById(id);
	}

	/**
	 * Enable batch mode for event operations
	 */
	enableBatchMode(): void {
		if (!this.batchService) {
			this.batchService = new BatchService(this.calendarId);
		}
	}

	/**
	 * Check if batch mode is enabled
	 */
	isBatchMode(): boolean {
		return this.batchService !== null;
	}

	/**
	 * Flush all queued batch operations
	 */
	flushBatchOperations(): void {
		if (this.batchService) {
			this.batchService.flushCreateOperations();
			this.batchService.flushDeleteOperations();
		}
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
		if (this.batchService) {
			// Queue the event for batch creation
			this.batchService.queueCreateEvent(
				title,
				startTime,
				endTime,
				description,
			);
		} else {
			// Create event immediately (legacy mode)
			const options = { description: description };
			this.calendar.createEvent(title, startTime, endTime, options);
		}
	}

	deleteEvent(event: GoogleAppsScript.Calendar.CalendarEvent) {
		if (this.batchService) {
			// Queue the event for batch deletion
			this.batchService.queueDeleteEvent(event.getId());
		} else {
			// Delete event immediately (legacy mode)
			event.deleteEvent();
		}
	}
}
