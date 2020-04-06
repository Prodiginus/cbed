const Discord = require('discord.js');
//const puppeteer = require('puppeteer');

const Client = new Discord.Client();

require('dotenv').config();

Client.on('ready', () => {
  console.log(`Logged in as ${Client.user.tag}`);
});

Client.on('message', (msg) => {
  if(msg.content == '!ping') {
    msg.channel.send('Pong!');
  }
  if(msg.content == '!kill') {
    Client.destroy();
  }
  if(msg.content.startsWith("!exec\n```c")) {
    let code = msg.content.toString().trim().split(`\n`);
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
    msg.channel.send(str2);
  }
});

Client.login(process.env.TOKEN)
