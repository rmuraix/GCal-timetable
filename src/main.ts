import { Cal } from "./calender";
import {
	config as importedConfig,
	deleteConfig as importedDeleteConfig,
	type Subject,
} from "./config";

const getEnv = (name: string) => {
	const properties = PropertiesService.getScriptProperties();
	return properties.getProperty(name) || "";
};

const isNotHolyday = (calender: Cal, date: Date): boolean => {
	if (date.getDay() === 0) return false;
	if (date.getDay() === 6) return false;
	const event = calender.getEventsForDay(date);
	if (event != null) {
		return !calender.isAlldayEvent(event);
	}
	return true;
};

const createDayEvents = (
	myCal: Cal,
	subject: (Subject | null)[] | undefined,
	targetDate: Date,
	startTime: number[][],
	minutes: number,
) => {
	if (!subject) return;
	for (let j = 0; j < subject.length; j++) {
		const currentSubject = subject[j];
		if (currentSubject) {
			const start = new Date(
				targetDate.setHours(startTime[j][0], startTime[j][1]),
			);
			const end = new Date(
				targetDate.setMinutes(targetDate.getMinutes() + minutes),
			);

			myCal.createEvent(currentSubject.name, start, end, {
				description: currentSubject.description,
			});
		}
	}
};

export const main = () => {
	// Load config from config.ts and set myCalId from environment
	const config = {
		...importedConfig,
		myCalId: getEnv("MY_CAL"),
	};
	const holydayCal = new Cal(config.holydayCalId);
	const myCal = new Cal(config.myCalId);

	// Enable batch mode for event creation
	myCal.enableBatchMode();

	let targetDate = config.startDate;

	let counter = 0;

	while (counter < config.count * config.subject.length) {
		if (
			isNotHolyday(holydayCal, targetDate) &&
			isNotHolyday(myCal, targetDate)
		) {
			const dayIndex = targetDate.getDay() - 1;
			createDayEvents(
				myCal,
				config.subject[dayIndex],
				targetDate,
				config.startTime,
				config.minutes,
			);
			counter++;
		}
		targetDate = new Date(targetDate.setDate(targetDate.getDate() + 1));
	}

	// Flush all queued batch operations
	myCal.flushBatchOperations();
};

export const deleteEvents = () => {
	// Load delete config from config.ts and set myCalId from environment
	const config = {
		...importedDeleteConfig,
		myCalId: getEnv("MY_CAL"),
	};
	const myCal = new Cal(config.myCalId);

	// Enable batch mode for event deletion
	myCal.enableBatchMode();

	const events = myCal.getEvents(config.startTime, config.endTime);

	for (let i = 0; i < events.length; i++) {
		if (!myCal.isAlldayEvent(events[i])) {
			myCal.deleteEvent(events[i]);
		}
	}

	// Flush all queued batch operations
	myCal.flushBatchOperations();
};
