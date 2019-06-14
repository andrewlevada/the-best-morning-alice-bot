const https = require('https');
const HTMLParser = require('node-html-parser');
const fs = require("fs");

exports.update = () => {
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
                console.log("news updated");
            });
        });
    });

    req.on('error', function (e) {
        console.log('news ERROR: ' + e.message);
    });
};

function newsFilter(newsText) {
    let finalText = [];

    newsText.forEach(text => {
        if (text.search(/.*(У|у)краин.*/i) != -1) return;
        if (text.search(/.*(Р|р)осси.*/i) != -1) return;
        if (text.search(/.*(В|в)ойн.*/i) != -1) return;
        if (text.search(/.*(Т|т)рагед.*/i) != -1) return;
        if (text.search(/.*ДТП.*/i) != -1) return;
        if (text.search(/.*(П|п)утин.*/i) != -1) return;
        if (text.search(/.*США.*/i) != -1) return;

        finalText.push(text);
    });

    return finalText;
}