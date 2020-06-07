const Discord = require('discord.js');
const puppeteer = require('puppeteer');
var Browser;
(async () => {
  Browser = await puppeteer.launch();
})();

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
    Browser.close();
    Client.destroy();
  }
  if(msg.content.startsWith("!help")) {
    msg.channel.send("Type !exec \\\`\\\`\\\`c and then a new line and then your function, and close it with \\\`\\\`\\\`. Currently this project only supports a function that uses 2 strings as parameters and returns a string that is less than 120 characters long. An example would look something like this: ```c\nchar* firstLetters(char* str1, char*str2) {\n\tchar* tmp[10];\n\ttmp[0]=str1[0];\n\ttmp[1]=str2[0];\n\ttmp[2]='\\0';\n\treturn tmp;\n}```");
  }
  if(msg.content.startsWith("!exec\n```c")) {
    if(msg.channel.type != "dm") {
      msg.channel.send("Please run this in a direct message with me");
      return;
    }
    var str = clean(msg.content.toString().trim());
    msg.channel.send("Running tests, please be patient...");
    str = addToMain(str);
    console.log(str);
    var output = await runFunc(str);
    if(output === "") {
      msg.channel.send("Empty message");
      return;
    }
    output = prettify(output);
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
  if(out.length === 0) {
    var r = /Exit code: \d/;
    var ec = parseInt(r.exec(debug)[0].split(" "));
    out = "Because the output is empty, there must be something wrong with your function";
  }
  out = await page.$eval('#output', el => el.value.toString());

  await page.close();
  
  return out;
}

const addToMain = (str) => {
  Fname = str.split(" ")[1].split("(")[0];
  var main = `
  #include <stdio.h>
  #include <stdlib.h>
  #include <string.h>
  char* ${Fname}(char*, char*, char*);
  int main(void) {
    char tmp[120];
    char h[120];
    ${Fname}("owo", "uwu", h);
    strcpy(tmp, h);
    printf("Given \\\"owo\\\" and \\\"uwu\\\", your function output: <%s>\\n", tmp);
    ${Fname}("wo", "uu", h);
    strcpy(tmp, h);
    printf("Given \\\"wo\\\" and \\\"uu\\\", your function output: <%s>\\n", tmp);
    return 0;
  }\n`;
  console.log(main);
  var full = main.concat(str);
  return full;
}

const prettify = (str) => {
  return `\`\`\`Test Results:\n${str}\`\`\``;
}