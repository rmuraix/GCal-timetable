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
4. Enable Calender API
5. Login via clasp: `npm run clasp login`
6. Run `npm run deploy` to push to Apps Script.
7. Run `main` on Apps Script.

## Available Commands

- `npm run generate-config` - Generate `src/config.ts` from the template
- `npm run check` - Run TypeScript type checking
- `npm run lint` - Run linter (biome)
- `npm run lint:fix` - Run linter with auto-fix
- `npm run format` - Check code formatting
- `npm run format:fix` - Format code automatically
- `npm run build` - Build the project
- `npm run deploy` - Check, build, and deploy to Apps Script

## Contributing

Your contribution is always welcome. Please read [Contributing Guide](.github/CONTRIBUTING.md).

## References

[Calendar Service - Google Apps Script](https://developers.google.com/apps-script/reference/calendar)
