const YandexTranslator = require('yandex.translate');
const config           = require("../config.js");
 
const translator = new YandexTranslator(config.params.translateAPIKey);

// Translate Russian -> English
exports.toEnglish = async (text) => {
    return await translator.translate(text, "en");
};

// Translate English -> Russian
exports.toRussian = async (text) => {
    return await translator.translate(text, "ru");
};