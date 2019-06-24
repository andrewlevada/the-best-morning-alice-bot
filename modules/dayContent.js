const fs = require("fs");
const logger = require("./logger.js");
let advices = JSON.parse(fs.readFileSync("./dayAdvices.json", "utf-8"));
let facts = JSON.parse(fs.readFileSync("./dayFacts.json", "utf-8"));

exports.getDayAdvice = function() {
    let date = new Date();

    let name = `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()}`;
    return {
        text: advices[name],
        tts: advices.tts[name]
    };
};

exports.getDayFact = function() {
    let date = new Date();

    let name = `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()}`;
    return {
        text: facts[name],
        tts: facts.tts[name]
    };
};

exports.update = function() {
    advices = JSON.parse(fs.readFileSync("./dayAdvices.json", "utf-8"));
    facts = JSON.parse(fs.readFileSync("./dayFacts.json", "utf-8"));
    logger.general("dayContent updated");
};