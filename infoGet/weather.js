const weather   = require('weather-js');
const translate = require("./translate.js");

exports.get = async (country, city) => {
    return new Promise((resolve, reject) => {
        try {
            weather.find({
                search: `${country}, ${city}`,
                degreeType: 'C'
            }, async function (err, result) {
                if (err) resolve("Погода очень непонятная. ");
    
                let data = result[0].current;
                let text = "";
                text += (await translate.toRussian(data.skytext)).toString() + ". ";
                text += `Температура ${data.temperature} градусов. `;
                resolve(text);
            });
        } catch (e) {
            resolve("Погода очень непонятная. ");
        }
    });
};