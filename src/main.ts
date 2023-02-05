import { Cal } from "./calender";

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
        holydayCalId: 'ja.japanese#holiday@group.v.calendar.google.com',
        myCalId: getEnv('MY_CAL'),
        startDate: new Date()
    };
    const holydayCal = new Cal(config.holydayCalId);
    const myCal = new Cal(config.myCalId);
}