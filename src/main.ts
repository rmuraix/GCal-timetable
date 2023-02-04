const getEnv = (name:string) => {
    const properties = PropertiesService.getScriptProperties();
    return properties.getProperty(name) || "";
}

const main = () => {
    const config = {
        holydayCalId: 'ja.japanese#holiday@group.v.calendar.google.com',
        myCalId: getEnv('MY_CAL'),
        startDate: new Date()
    };
}