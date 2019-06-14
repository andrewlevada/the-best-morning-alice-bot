const fs = require("fs"); // File System module
const lines = JSON.parse(fs.readFileSync("./lines.json", "utf-8")); // Get scripted lines

exports.getTime = function (timeZone) {
    timeZone = +timeZone - 1;
    if (!Number.isInteger(timeZone)) return rae(lines.date.wrong);

    let date = new Date();

    let changed = 0;
    let hours = date.getUTCHours() + timeZone;
    if (hours < 0 | hours > 23) {
        if (timeZone > 0) {
            hours -= 24;
            changed = 1;
        } else if (timeZone < 0) {
            hours += 24;
            changed = -1;
        }
        else return rae(lines.date.wrong);
    }

    let minutes = date.getUTCMinutes();
    if (minutes == 0) minutes = "00";
    else if (minutes < 10) minutes = "0" + minutes;

    let weekDay = date.getUTCDay() + changed;
    if (weekDay == -1) weekDay = 6;
    if (weekDay == 7) weekDay = 0;
    weekDay = lines.date.weekDays[weekDay];

    return `Время ${hours}:${minutes}. ${weekDay}.`;
};

function rae(array) { // Random array element
    let index = Math.floor(Math.random() * array.length);
    return array[index];
}