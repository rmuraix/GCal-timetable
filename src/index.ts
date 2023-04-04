import { main } from "./main";
import { deleteEvents } from "./main";

declare const global: {
  [x: string]: unknown;
};

global.main = main;
global.deleteEvents = deleteEvents;
