const fs = require("fs");

let counters = {
    "18.6.2019": {
        total: 0,
        normal: 0,
        addit: 0
    }
};

counters = JSON.parse(fs.readFileSync("./log/stats.json"));

exports.general = function (text) {
    let dateTime = getDateTime();
    fs.appendFileSync("./log/" + dateTime[0], `${dateTime[1]}: GENERAL ${text}\n`);
};

exports.info = function (ctx, place) {
    if (ctx.originalUtterance != "ping") {
        let dateTime = getDateTime();
        fs.appendFileSync("./log/" + dateTime[0], `${dateTime[1]}: INFO text '${ctx.originalUtterance}' is in ${place}\n`);
    }
};

exports.error = function (text, e) {
    let dateTime = getDateTime();
    fs.appendFileSync("./log/" + dateTime[0], `${dateTime[1]}: ERROR at ${text} error ${e}\n`);
};

exports.counter = function (name) {
    let dateTime = getDateTime();
    if (!counters[dateTime[0]]) {
        counters[dateTime[0]] = {
            "total": 0,
            "normal": 0,
            "addit": 0
        };
    }
    counters[dateTime[0]][name] += 1;
};

exports.countersFix = function () {
    fs.writeFileSync("./log/stats.json", JSON.stringify(counters));
};

function getDateTime() {
    let date = new Date();
    let time = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    let longTime = `${time}-${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}`;
    return [time, longTime];
}