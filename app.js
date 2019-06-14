const {
  Alice,
  Markup
} = require('yandex-dialogs-sdk'); // Alice module
const fs = require("fs"); // File System module
const translate = require("./modules/translate.js"); // Translate module
const weather = require("./modules/weather.js"); // Weathr module
const dateTime = require("./modules/date.js");
const lines = JSON.parse(fs.readFileSync("./lines.json", "utf-8")); // Get scripted lines
const alice = new Alice();
const M = Markup;

require("./dataUpdate.js").start();

alice.command(["Что делать", "Помоги", "Помощь", "Я не понимаю", "Что дальше", "Что ты умеешь"], async ctx => {
  if (ctx.data.session.new) {
    if (checkUser(ctx)) { // If user exists
      let result = await normalReq(ctx);
      return {
        text: result[0],
        tts: result[1]
      };
    } else {
      let i = rai(lines.extras.newUser);
      return {
        text: lines.extras.newUser[i],
        tts: lines.tts.extras.newUser[i],
        buttons: [M.button('Я в Москве'), M.button('Я в Питере')]
      };
    }
  } else {
    let i = rai(lines.extras.help);
    return {
      text: lines.extras.help[i],
      tts: lines.tts.extras.help[i],
      buttons: [M.button('Проверка'), M.button('Я в Москве')]
    };
  }
});

alice.command(["Проверка", "Проверить"], async (ctx) => {
  if (checkUser(ctx)) { // If user exists
    let result = await normalReq(ctx);
    return {
      text: result[0],
      tts: result[1]
    };
  } else {
    let i = rai(lines.extras.cityUnknown);
    return {
      text: lines.extras.cityUnknown[i],
      tts: lines.tts.extras.cityUnknown[i],
      buttons: [M.button('Я в Москве'), M.button('Я в Питере')]
    };
  }
});

alice.command(/Мой город .*/ig, async ctx => { // Goto citySet()
  let result = await citySet(ctx);
  return {
    text: result[0],
    tts: result[1]
  };
});
alice.command(/Я в .*/ig, async ctx => { // Goto citySet()
  let result = await citySet(ctx);
  return {
    text: result[0],
    tts: result[1]
  };
});
alice.command(/В .*/ig, async ctx => { // Goto citySet()
  let result = await citySet(ctx);
  return {
    text: result[0],
    tts: result[1]
  };
});

alice.command(/Спасибо.*/, async ctx => {
  let i = rai(lines.extras.thanks);
  return {
    text: lines.extras.thanks[i],
    tts: lines.tts.extras.thanks[i],
    end_session: true
  };
});

alice.any(async ctx => {
  let i = rai(lines.extras.other);
  return {
    text: lines.extras.other[i],
    tts: lines.tts.extras.other[i],
    buttons: [M.button('Проверка'), M.button('Я в Москве')]
  };
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

    let i = rai(lines.city.saved);
    return [lines.city.saved[i], lines.tts.city.saved[i]];
  } catch (e) {
    if (e == "changed") {
      let i = rai(lines.city.changed);
      return [lines.city.changed[i], lines.tts.city.changed[i]]; // If changed
    } else {
      let i = rai(lines.city.failed);
      return [lines.city.failed[i], lines.tts.city.failed[i]]; // If failed
    }
  }
}

async function normalReq(ctx) {
  return new Promise(async (resolve, reject) => { // Function as promise
    try {
      console.log("normal req");

      let text = "";
      let tts = "";
      let i;

      i = rai(lines.normal.hello);
      text += lines.normal.hello[i];
      tts += lines.tts.normal.hello[i] + " - ";

      let city = checkUser(ctx); // Try to get city
      if (!city) {
        let i = rai(lines.normal.gotoCity);
        resolve([lines.normal.gotoCity[i], lines.tts.normal.gotoCity[i]]); // Reply gotoCity if new user
      }

      let timeText = dateTime.getTime(await weather.getTimeZone(city));
      text += timeText;
      tts += timeText + " - - - ";

      i = rai(lines.normal.news);
      text += "\n\r" + lines.normal.news[i];
      tts += lines.tts.normal.news[i] + " - ";

      let newsData = JSON.parse(fs.readFileSync("./news.json")); // Get news data

      let startIndex = Math.floor(Math.random() * (newsData.news.length - 3));
      for (let i = startIndex; i < startIndex + 3; i++) {
        text += (`${newsData.news[i]}. `); // Add three random news to text
        tts += (`${newsData.news[i]}. `); // Add three random news to text
      }

      i = rai(lines.normal.weather);
      text += "\n\r" + lines.normal.weather[i];
      tts += lines.tts.normal.weather[i] + " - ";

      await weather.get(city).then((data) => {
        text += data; // Add if city found
        tts += data + " - - - ";
      });

      i = rai(lines.normal.end);
      text += lines.normal.end[i];
      tts += lines.tts.normal.end[i];

      resolve([text, tts]); // Send text
    } catch (ex) {
      console.log("normalreq error   " + ex);
      resolve(["Что-то мне не хорошо. Наверное я заболела. Проведайте меня позже.",
        "Что-то мне не хорошо+. - Наве+рное я заболе+ла. Прове+дайте меня+ по+зже."
      ]);
    }
  });
}

function rae(array) { // Random array element
  let index = Math.floor(Math.random() * array.length);
  return array[index];
}

function rai(array) {
  let index = Math.floor(Math.random() * array.length);
  return index;
}

function checkUser(ctx) {
  let fileData = JSON.parse(fs.readFileSync("./db.json")); // Get db from file
  let result = search(ctx.userId, fileData).userCity;
  return result;
}

function search(nameKey, myArray) {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i].userId == nameKey) {
      return myArray[i];
    }
  }
  return false;
}

const server = alice.listen(3000, '/'); // Start server