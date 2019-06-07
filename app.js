const {
  Alice,
  Reply
} = require('yandex-dialogs-sdk'); // Alice module
const fs = require("fs"); // File System module
const translate = require("./infoGet/translate.js"); // Translate module
const weather = require("./infoGet/weather.js"); // Weathr module
const lines = JSON.parse(fs.readFileSync("./lines.json", "utf-8")); // Get scripted lines
const alice = new Alice();

require("./dataUpdate.js").start();

alice.command(["Что делать", "Помоги", "Помощь", "Я не понимаю", "Что дальше"], async ctx => {
  if (ctx.data.session.new) {
    if (checkUser(ctx)) { // If user exists
      return Reply.text(await normalReq(ctx));
    } else {
      return Reply.text(rae(lines.extras.newUser));
    }
  }
  else return Reply.text(rae(lines.extras.help));
});

alice.command(["Проверка", "Проверить"], async (ctx) => {
  if (checkUser(ctx)) { // If user exists
    return Reply.text(await normalReq(ctx));
  } else {
    return Reply.text(rae(lines.extras.newUser));
  }
});

alice.command(/Мой город .*/ig, async ctx => { // Goto citySet()
  return await citySet(ctx);
});
alice.command(/Я в .*/ig, async ctx => { // Goto citySet()
  return await citySet(ctx);
});
alice.command(/В .*/ig, async ctx => { // Goto citySet()
  return await citySet(ctx);
});

alice.any(async ctx => {
  return Reply.text(rae(lines.extras.other));
});

async function citySet(ctx) {
  console.log("city req");
  try {
    let cityData = ctx.nlu.entities[0].value.city; // Get city from messege
    if (cityData.substring(0, 5) == "город") cityData = cityData.substring(6, cityData.length); // Remove "город" from messege
    cityData = (await translate.toEnglish(cityData)).toString(); // Translate city to English

    let fileData = JSON.parse(fs.readFileSync("./db.json")); // Get db from file

    fileData.forEach(element => { //
      if (element.userId == ctx.userId) { // Try to find user in db
        element.userCity = cityData; //
        fs.writeFileSync("./db.json", JSON.stringify(fileData)); // If found change city
        throw "changed"; //
      } //
    }); //

    // Create new user in db
    fileData.push({
      userId: ctx.userId,
      userCountry: "Russia",
      userCity: cityData
    });

    fs.writeFileSync("./db.json", JSON.stringify(fileData)); // Save changed db

    return Reply.text(rae(lines.city.saved));
  } catch (e) {
    if (e == "changed") return Reply.text(rae(lines.city.changed)); // If changed
    else return Reply.text(rae(lines.city.failed)); // If failed
  }
}

async function normalReq(ctx) {
  return new Promise(async (resolve, reject) => { // Function as promise
    try {
      console.log("normal req");

      let text = "";
      text += `${rae(lines.normal.hello)}`; // Add hello
      text += `\n\r${rae(lines.normal.news)}`; // Add news intro

      let newsData = JSON.parse(fs.readFileSync("./news.json")); // Get news data

      for (let i = 0; i < 3; i++) { //
        text += (`${rae(newsData.news)}. `); // Add three random news to text
      }

      text += `\n\r${rae(lines.normal.weather)}`; // Add weather intro 

      let city = checkUser(ctx); // Try to get city
      await weather.get(city).then((data) => {
        if (city) text += data; // Add if city found
        else resolve(rae(lines.normal.gotoCity)); // Reply gotoCity if new user
      });

      text += `${rae(lines.normal.end)}`; // Add end

      resolve(text); // Send text
    } catch (ex) {
      console.log("normalreq   " + ex);
      resolve("Что-то мне не хорошо. Наверное я заболела. Проведайте меня позже.");
    }
  });
}

function rae(array) { // Random array element
  let index = Math.floor(Math.random() * array.length);
  return array[index];
}

function search(nameKey, myArray) {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i].userId == nameKey) {
      return myArray[i];
    }
  }
  return false;
}

function checkUser(ctx) {
  let fileData = JSON.parse(fs.readFileSync("./db.json")); // Get db from file
  let result = search(ctx.userId, fileData).userCity;
  return result;
}

const server = alice.listen(3000, '/'); // Start server