# GCal-timetable

[![License](https://img.shields.io/github/license/rmuraix/Gcal-timetable)](./LICENSE)

## About

Makeing timetable on Google Calender using Google Apps Script.  
Holidays and all-day events are skipped.

## Requirements

- Node.js

## Usage

1. Generate the configuration file from the template:
   ```bash
   npm run generate-config
   ```
2. Update the configuration values in `src/config.ts` according to your needs:
   - Modify `subject` array with your timetable schedule
   - Adjust `startTime` for class periods
   - Change `minutes` for class duration
   - Set `count` for number of weeks to generate
3. Create a property named MY_CAL and set your calendar ID on Google Apps Script.
4. Run `npm run deploy` to push to Apps Script.
5. Run `main` on Apps Script.

## Contributing

Your contribution is always welcome. Please read [Contributing Guide](.github/CONTRIBUTING.md).

## References

[Calendar Service - Google Apps Script](https://developers.google.com/apps-script/reference/calendar)
