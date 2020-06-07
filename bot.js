const Discord = require('discord.js');
const puppeteer = require('puppeteer');

const Client = new Discord.Client();

require('dotenv').config();

Client.on('ready', () => {
  console.log(`Logged in as ${Client.user.tag}`);
});

Client.on('message', async (msg) => {
  if(msg.content == '!ping') {
    msg.channel.send('Pong!');
  }
  if(msg.content == '!kill') {
    Client.destroy();
  }
  if(msg.content.startsWith("!exec\n```c")) {
    if(msg.channel.type != "dm") {
      msg.channel.send("Please run this in a direct message with me");
      return;
    }
    str2 = clean(msg.content.toString().trim());
    msg.channel.send("Running tests, please be patient...");
    var output = await runFunc(str2);
    if(output === "") {
      output = "Empty message";
    }
    msg.channel.send(output);
  }
});

Client.login(process.env.TOKEN)

const clean = (str1) => {
  let code = str1.split(`\n`);
  let str = [];
  for(var i = 2; i<code.length; i++) {
    if(code[i] != []) {
      str.push(code[i]);
    }
  }
  var str2 = "";
  for(var i = 0; i<str.length-1 ; i++) {
    str2 = str2.concat(str[i]);
    str2 = str2.concat(`\n`);
  }
  return str2;
}

const runFunc = async (str2) => {
  const Browser = await puppeteer.launch();
  const page = await Browser.newPage();
  await page.goto('https://tio.run/#c-clang', {waitUntil: 'domcontentloaded'});
  var out = "";
  await page.waitForSelector('#code', {visible: true});
  await page.waitForFunction((str2) => {
    code.value = str2;
    return true;
  }, {polling: 100}, str2);
  var code = await page.$eval('#code', el => el.value);
  await page.waitForSelector('#run', {visible: true});
  await page.click('#run');
  await page.waitForFunction('debug.value != ""', {polling: 100});
  var debug = await page.$eval('#debug', el => el.value.toString());
  if(out.length == 0) {
    var r = /Exit code: \d/;
    var ec = parseInt(r.exec(debug)[0].split(" "));
    out = "Because the output is empty, there must be something wrong with your function";
  }
  out = await page.$eval('#output', el => el.value.toString());
  await page.close();
  await Browser.close();
  return out;
}