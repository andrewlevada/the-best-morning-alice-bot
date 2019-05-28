const config = require("./config.js");
const news   = require("./infoGet/news.js");

// Update data in some time
exports.start = () => {
    news.update();
    let newsInterval = setInterval(news.update, config.params.newsInterval);
};