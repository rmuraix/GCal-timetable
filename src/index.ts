import { deleteEvents, main } from "./main";

declare const global: {
	[x: string]: unknown;
};

global.main = main;
global.deleteEvents = deleteEvents;
