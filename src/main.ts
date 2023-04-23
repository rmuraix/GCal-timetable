import { Cal } from "./calender";
import { subjects } from "./secret";

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
  subject: string[][],
  targetDate: Date,
  startTime: number[][],
  minutes: number
) => {
  for (let j = 0; j < subject.length; j++) {
    if (subject[j][0] != "") {
      const start = new Date(
        targetDate.setHours(startTime[j][0], startTime[j][1])
      );
      const end = new Date(
        targetDate.setMinutes(targetDate.getMinutes() + minutes)
      );

      myCal.createEvent(subject[j][0], start, end, subject[j][1]);
    }
  }
};

export const main = () => {
  const config = {
    // Calendar settings
    holydayCalId: "ja.japanese#holiday@group.v.calendar.google.com",
    myCalId: getEnv("MY_CAL"),
    // Setting about timetable
    startDate: new Date(),
    startTime: [
      [9, 20],
      [11, 15],
      [13, 50],
      [15, 45],
    ],
    // You need to create a secret.ts and create an array.
    subject: subjects,
    minutes: 105,
    count: 2,
  };
  const holydayCal = new Cal(config.holydayCalId);
  const myCal = new Cal(config.myCalId);

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
        config.minutes
      );
      counter++;
    }
    targetDate = new Date(targetDate.setDate(targetDate.getDate() + 1));
  }
};

export const deleteEvents = () => {
  const config = {
    startTime: new Date(),
    endTime: new Date(),
    myCalId: getEnv("MY_CAL"),
  };
  const myCal = new Cal(config.myCalId);

  const events = myCal.getEvents(config.startTime, config.endTime);

  for (let i = 0; i < events.length; i++) {
    if (!myCal.isAlldayEvent(events[i])) {
      myCal.deleteEvent(events[i]);
    }
  }
};
