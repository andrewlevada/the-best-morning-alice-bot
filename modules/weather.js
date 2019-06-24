const weather = require('weather-js');
const translate = require("./translate.js");
const fs = require("fs");
const lines = JSON.parse(fs.readFileSync("./lines.json", "utf-8")); // Get scripted lines

exports.get = async (country, city) => {
    return new Promise((resolve, reject) => {
        try {
            weather.find({
                search: `${country}, ${city}`,
                degreeType: 'C'
            }, async function (err, result) {
                if (err) {
                    logger.error("weather get", err);
                    resolve("Погода очень непонятная. ");
                }

                let data = result[0].current;
                let text = "";
                try {
                    text += (await translate.toRussian(data.skytext + " weather")).toString().match(/(.*) погода/i)[1] + ". ";
                } catch (e) {
                    text += (await translate.toRussian(data.skytext + " weather")).toString() + ". ";
                }
                text += `Температура ${data.temperature}°. `;
                resolve(text);
            });
        } catch (e) {
            logger.error("weather get", e);
            resolve("Погода очень непонятная. ");
        }
    });
};

exports.getFullWeather = async (city) => {
    return new Promise((resolve, reject) => {
        try {
            weather.find({
                search: `${city}`,
                degreeType: 'C'
            }, async function (err, result) {
                if (err) {
                    logger.error("fullWeather get", err);
                    resolve({
                        text: "Погода очень непонятная. "
                    });
                }

                let data = result[0];
                let text = "";
                let tts = "";

                text += lines.infoDesk.weather.intro;
                tts += lines.tts.infoDesk.weather.intro;

                let state = (await translate.toRussian(data.forecast[0].skytextday + " weather")).toString().toLowerCase();
                text += lines.infoDesk.weather.tomorrow + state + ". ";
                tts += lines.tts.infoDesk.weather.tomorrow + state + ". ";

                text += lines.infoDesk.weather.tomorrowTemp + data.forecast[0].low + " до " + data.forecast[0].high + "°. ";
                tts += lines.tts.infoDesk.weather.tomorrowTemp + data.forecast[0].low + " до " + data.forecast[0].high + "°. ";

                state = (await translate.toRussian(data.forecast[1].skytextday + " weather")).toString().toLowerCase();
                text += lines.infoDesk.weather.afterTomorrow + state + ". ";
                tts += lines.tts.infoDesk.weather.afterTomorrow + state + ". ";

                text += lines.infoDesk.weather.outro;
                tts += lines.infoDesk.weather.outro;

                text += lines.infoDesk.next;
                tts += lines.tts.infoDesk.next;

                resolve({
                    text,
                    tts
                });
            });
        } catch (e) {
            logger.error("fullWeather get", e);
            resolve({
                text: "Погода очень непонятная. "
            });
        }
    });
};

exports.getTimeZone = async (country, city) => {
    return new Promise((resolve, reject) => {
        try {
            weather.find({
                search: `${country}, ${city}`,
                degreeType: 'C'
            }, async function (err, result) {
                if (err) {
                    logger.error("timeZone get", err);
                    resolve("failed");
                }

                resolve(result[0].location.timezone);
            });
        } catch (e) {
            logger.error("timeZone get", e);
            resolve("failed");
        }
    });
};