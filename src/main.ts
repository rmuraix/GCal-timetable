import { Cal } from "./calender";
import { subject } from "./secret";

const getEnv = (name: string) => {
    const properties = PropertiesService.getScriptProperties();
    return properties.getProperty(name) || "";
}

const isHolyday = (holydayCal: Cal, date: Date): boolean => {
    const event = holydayCal.getAllDayEvent(date);
    if(event != null){
        return holydayCal.isAlldayEvent(event);
    }else{
        return false;
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

    let targetDate = config.startDate

    for (let i = 0; i < config.count; i++) {
        // a week
        let num = targetDate.getDay() - 1;
        do {
            // a day
            if (!isHolyday(holydayCal, targetDate)) {
                for (let j = 0; j < 4; j++) {
                    if (config.subject[num][j][0] != "") {
                        myCal.createEvent(
                            config.subject[num][j][0],
                            new Date(targetDate.setHours(config.startTime[j][0], config.startTime[j][1])),
                            new Date(targetDate.setMinutes(targetDate.getMinutes() + config.minutes)),
                            config.subject[num][j][1]
                        );
                    }
                }
            }
            targetDate = new Date(targetDate.setDate(targetDate.getDate() + 1));
            num++;
        } while ((targetDate.getDay() < 6) && (targetDate.getDay() > 0));
        targetDate = new Date(targetDate.setDate(targetDate.getDate() + 2));
    }
}