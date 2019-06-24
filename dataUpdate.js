const config = require("./config.js");
const news = require("./modules/news.js");
const dayAdvice = require("./modules/dayContent.js");
const logger = require("./modules/logger.js");

exports.start = () => {
    logger.general("dataUpdate started");

    news.update();
    news.updateLongNews();
    dayAdvice.update();
    
    setInterval(news.update, config.params.newsInterval);
    setInterval(news.updateLongNews, config.params.newsInterval);
    setInterval(dayAdvice.update, config.params.dayContentInterval);
    setInterval(logger.countersFix, config.params.countersInterval);
};