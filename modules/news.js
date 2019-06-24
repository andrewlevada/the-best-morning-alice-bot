const https = require('https');
const HTMLParser = require('node-html-parser');
const fs = require("fs");
const logger = require("./logger.js");
const lines = JSON.parse(fs.readFileSync("./lines.json", "utf-8"));

exports.update = function () {
    let req = https.get("https://news.yandex.ru/index.html", function (res) {
        let rawData = [];
        res.on('data', function (chunk) {
            rawData.push(chunk);
        });

        res.on('end', function () {
            let data = Buffer.concat(rawData);
            let htmlData = HTMLParser.parse(data.toString());

            let newsText = [];

            htmlData.querySelectorAll(".story__title a").forEach(element => {
                newsText.push(element.innerHTML);
            });

            newsText = newsFilter(newsText);

            let fileData = {
                news: newsText
            };

            fs.writeFile('news.json', JSON.stringify(fileData), 'utf8', () => {
                logger.general("news updated");
            });
        });
    });

    req.on('error', function (e) {
        logger.error("news update", e);
    });
};

exports.updateLongNews = function () {
    let req = https.get("https://news.yandex.ru/index.html", function (res) {
        let rawData = [];
        res.on('data', function (chunk) {
            rawData.push(chunk);
        });

        res.on('end', async function () {
            let data = Buffer.concat(rawData);
            let htmlData = HTMLParser.parse(data.toString());

            let newsLinks = [];

            htmlData.querySelectorAll(".story__title a").forEach(element => {
                newsLinks.push(element.attributes.href);
            });

            getFullNews(newsLinks);
        });
    });

    req.on('error', function (e) {
        logger.error("longNews update", e);
    });
};

exports.getLongNews = function () {
    let text = "";
    let tts = "";
    let newsData = JSON.parse(fs.readFileSync("./longNews.json"));

    tts += lines.tts.infoDesk.news.intro;

    text += lines.infoDesk.news.first;
    tts += lines.tts.infoDesk.news.first;

    let i = Math.floor(Math.random() * (newsData.longNews.length - 3));

    text += (`${newsData.longNews[i]} `);
    tts += (`${newsData.longNews[i]} `);
    i++;

    text += lines.infoDesk.news.second;
    tts += lines.tts.infoDesk.news.second;

    text += (`${newsData.longNews[i]} `);
    tts += (`${newsData.longNews[i]} `);
    i++;

    text += lines.infoDesk.news.third;
    tts += lines.tts.infoDesk.news.third;

    text += (`${newsData.longNews[i]} `);
    tts += (`${newsData.longNews[i]} `);

    tts += lines.tts.infoDesk.news.outro;

    text += lines.infoDesk.next;
    tts += lines.tts.infoDesk.next;

    return {
        text: text,
        tts: tts
    };
};

function getFullNews(links) {
    let content = [];

    links.forEach(link => {
        let req = https.get("https://news.yandex.ru" + link, function (res) {
            let rawData = [];
            res.on('data', function (chunk) {
                rawData.push(chunk);
            });

            res.on('end', function () {
                let data = Buffer.concat(rawData);
                let htmlData = HTMLParser.parse(data.toString());

                let text = (htmlData.querySelector(".doc__text").rawText);

                if (text.search(/([А-ЯA-Z]\.)|(\.[^\s])/) == -1) {
                    content.push(text.match(/([^\.]+\.){1,2}/)[0]);

                    if (link == links[links.length - 1]) {
                        let fileData = {
                            longNews: content
                        };

                        fs.writeFile('longNews.json', JSON.stringify(fileData), 'utf8', () => {
                            logger.general("longNews updated");
                        });
                    }
                }
            });
        });

        req.on('error', function (e) {});
    });
}

function newsFilter(newsText) {
    let finalText = [];

    newsText.forEach(text => {
        if (text.search(/.*украин.*/i) != -1) return;
        if (text.search(/.*росси.*/i) != -1) return;
        if (text.search(/.*войн.*/i) != -1) return;
        if (text.search(/.*трагед.*/i) != -1) return;
        if (text.search(/.*ДТП.*/i) != -1) return;
        if (text.search(/.*путин.*/i) != -1) return;
        if (text.search(/.*убит.*/i) != -1) return;
        if (text.search(/.*США.*/i) != -1) return;

        finalText.push(text);
    });

    return finalText;
}