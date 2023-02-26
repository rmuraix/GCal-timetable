import { Cal } from "./calender";
import { subject } from "./secret";

const getEnv = (name: string) => {
    const properties = PropertiesService.getScriptProperties();
    return properties.getProperty(name) || "";
}

const isHolyday = (calender: Cal, date: Date): boolean => {
    const event = calender.getAllDayEvent(date);
    if (event != null) {
        return calender.isAlldayEvent(event);
    } else {
        return false;
    }
}

const createDayEvents = (myCal: Cal, subject: string[][][], num: number, targetDate: Date, startTime: number[][], minutes: number) => {
    for (let j = 0; j < 4; j++) {
        if ((subject[num][j][0] != "")) {
            let start = new Date(targetDate.setHours(startTime[j][0], startTime[j][1]));
            let end = new Date(targetDate.setMinutes(targetDate.getMinutes() + minutes));

            myCal.createEvent(subject[num][j][0], start, end, subject[num][j][1]);
        }
    }
}

export const main = () => {
    const config = {
        // Calendar settings
        holydayCalId: 'ja.japanese#holiday@group.v.calendar.google.com',
        myCalId: getEnv('MY_CAL'),
        // Setting about timetable
        startDate: new Date(),
        startTime: [[9, 20], [11, 15], [13, 50], [15, 45]],
        // You need to create a secret.ts and create an array.
        subject: subject,
        minutes: 105,
        count: 2
    };
    const holydayCal = new Cal(config.holydayCalId);
    const myCal = new Cal(config.myCalId);

    let targetDate = config.startDate;

    let counter = [0, 0, 0, 0, 0];

    // Loop until each value of the counter equals config.count.
    while ((counter.reduce((sum, num) => sum + num)) < config.count * counter.length) {
        // a week
        let num = targetDate.getDay() - 1;
        while ((targetDate.getDay() > 0) && (targetDate.getDay() < 6)) {
            // a day
            if (!(isHolyday(holydayCal, targetDate) || isHolyday(myCal, targetDate)) && (counter[num] < config.count)) {
                createDayEvents(myCal, config.subject, num, targetDate, config.startTime, config.minutes);
                counter[num]++;
            }
            targetDate = new Date(targetDate.setDate(targetDate.getDate() + 1));
            num++;
        }
        // Move on to the next day.
        targetDate = new Date(targetDate.setDate(targetDate.getDate() + 1));
    }
}

export const deleteEvents = () => {
    const config = {
        startTime: new Date(),
        endTime: new Date (),
        myCalId: getEnv('MY_CAL')
    };
    const myCal = new Cal(config.myCalId);

    const events = myCal.getEvents(config.startTime, config.endTime);

    for (let i = 0; i < events.length; i++) {
        myCal.deleteEvent(events[i]);
    }

}