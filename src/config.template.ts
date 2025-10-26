/**
 * Configuration template for GCal-timetable
 *
 * To use this application:
 * 1. Copy this file to `src/config.ts`
 * 2. Update the configuration values below according to your needs
 * 3. Run `npm run deploy` to push to Apps Script
 */

export interface Config {
	// Calendar settings
	holydayCalId: string;
	myCalId: string;
	// Setting about timetable
	startDate: Date;
	startTime: number[][];
	subject: string[][][];
	minutes: number;
	count: number;
}

export interface DeleteConfig {
	startTime: Date;
	endTime: Date;
	myCalId: string;
}

/**
 * Main configuration for creating timetable events
 *
 * Configuration options:
 * - holydayCalId: Calendar ID for holidays (e.g., "ja.japanese#holiday@group.v.calendar.google.com")
 * - myCalId: Your calendar ID (retrieved from MY_CAL environment variable)
 * - startDate: Start date for creating events
 * - startTime: Array of [hour, minute] pairs for each class period
 * - subject: 3D array of subjects [day][period][name, description]
 * - minutes: Duration of each class in minutes
 * - count: Number of weeks to generate
 */
export const config: Config = {
	holydayCalId: "ja.japanese#holiday@group.v.calendar.google.com",
	myCalId: "", // Will be set from environment variable
	startDate: new Date(),
	startTime: [
		[9, 20],
		[11, 15],
		[13, 50],
		[15, 45],
	],
	subject: [
		[
			["subject name", "Description (optional)."],
			["subject name", "Description (optional)."],
			[""],
			[""],
		],
		[[""], [""], ["subject name"], ["subject name"]],
		[["subject name"], ["subject name"], ["subject name"], [""]],
		[["subject name"], ["subject name"], [""], ["subject name"]],
		[[""], ["subject name"], ["subject name"], [""]],
	],
	minutes: 105,
	count: 2,
};

/**
 * Configuration for deleting events
 *
 * Configuration options:
 * - startTime: Start time for deleting events
 * - endTime: End time for deleting events
 * - myCalId: Your calendar ID (retrieved from MY_CAL environment variable)
 */
export const deleteConfig: DeleteConfig = {
	startTime: new Date(),
	endTime: new Date(),
	myCalId: "", // Will be set from environment variable
};
