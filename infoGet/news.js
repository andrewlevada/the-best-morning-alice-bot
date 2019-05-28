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

            let fileData = {
                news: newsText
            };

            fs.writeFile('news.json', JSON.stringify(fileData), 'utf8', () => {
                console.log("done");
            });
        });
    });

    req.on('error', function (e) {
        console.log('ERROR: ' + e.message);
    });
};