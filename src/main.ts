import { Cal } from "./calender";
import { subject } from "./secret";

const getEnv = (name: string) => {
    const properties = PropertiesService.getScriptProperties();
    return properties.getProperty(name) || "";
}

const isHolyday = (holydayCal: Cal, date: Date): boolean => {
    const event = holydayCal.getAllDayEvent(date);
    if (event) {
        return true;
    } else {
        return false;
    }
}

const main = () => {
    const config = {
        // Calendar settings
        holydayCalId: 'ja.japanese#holiday@group.v.calendar.google.com',
        myCalId: getEnv('MY_CAL'),
        // Setting about timetable
        startDate: new Date(),
        startTime: ["9:20", "11:15", "13:50", "15:45"],
        // You need to create a secret.ts and create an array.
        subject: subject,
        minutes: 105,
        count: 13
    };
    const holydayCal = new Cal(config.holydayCalId);
    const myCal = new Cal(config.myCalId);
}