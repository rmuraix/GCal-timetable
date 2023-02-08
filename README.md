# GCal-timetable
[![License](https://img.shields.io/github/license/rmuraix/Gcal-timetable)](./LICENSE)  
## About
Makeing timetable on Google Calender using Google Apps Script.  
## Usage
 
1. Change the contents of `config` in the `main` function.  
2. Create `secret.ts` on the same level as `main.ts` and create the following constants.  
```typescript
export const subject = [
    [["subject name", "Description (optional)."], ["subject name", "Description (optional)."], [""], [""]],
    [[""], [""], ["subject name"], ["subject name"]],
    [["subject name"], ["subject name"], ["subject name"], [""]],
    [["subject name"], ["subject name"], [""], ["subject name"]],
    [[""], ["subject name"], ["subject name"], [""]]
];
```  
3. Push to Apps Script via [clasp](https://github.com/google/clasp).  
4. Create a property named MY_CAL and set your calendar ID on Google Apps Script. 
5. Run `main` on Apps Script.
## Contributing  
Your contribution is always welcome. Please read [Contributing Guide](.github/CONTRIBUTING.md).  
## References
[Calendar Service - Google Apps Script](https://developers.google.com/apps-script/reference/calendar)
