var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const axios = require('axios')
//const TelegramBot = require('node-telegram-bot-api');

var buttonTouched=false;
var earlierAction="";
var schoolName="";
var place="";
var event="";
var pic;
var picture;
var s_name = "School name";  
var s_loc = "School location";  
var u_pic = "Upload Picture";  
var d_event = "Describe Event";
var done = "Done";
//curl -F "url=https://telegrambot-ee0el57of.now.sh/start" https://api.telegram.org/bot891875030:AAGl9ik1oLZynXVFNnz581fZ1ZkOZ4d6tVI/setWebhook
app.use(bodyParser.json()) // for parsing application/json
app.use(
  bodyParser.urlencoded({
    extended: true
  })
) // for parsing application/x-www-form-urlencoded

//This is the route the API will call

app.post('/', function(req, res ) {
  const  message  = req.body.message 

  if(buttonTouched){
    switch(earlierAction){
      case s_name:
        schoolName= message.text.toLowerCase();
        buttonTouched=false;
        break;
      case s_loc:
        place= message.text.toLowerCase();
        buttonTouched=false;
        break;
      case u_pic:
      pic=message.photo[2].file_id;
       /* axios.post('https://api.telegram.org/bot891875030:AAGl9ik1oLZynXVFNnz581fZ1ZkOZ4d6tVI/sendPhoto',
               {
                chat_id: message.chat.id,
                photo: message.photo[2].file_id,
                caption: 'School: '+schoolName+'\n'+'Location: '+place+'\n'+'Event: '+event
               })
               .then(response => {
                // We get here if the message was successfully posted
                console.log('Message posted')
                res.end('ok')
               })
               .catch(err => {
                // ...and here if it was not
                console.log('Error :', err)
                res.end('Error :' + err)
               });*/
        buttonTouched=false;
        break;
      case d_event:
        event= message.text.toLowerCase();
        buttonTouched=false;
        break;
    }
    return;
  }
    if (message.text.indexOf(s_name) === 0) {
    buttonTouched=true;
    earlierAction=s_name;
    axios.post('https://api.telegram.org/bot891875030:AAGl9ik1oLZynXVFNnz581fZ1ZkOZ4d6tVI/sendMessage',
          {
            chat_id: message.chat.id,
            text: 'Send Your School Name'
          })
          .then(response => {
            // We get here if the message was successfully posted
            console.log('Message posted')
             res.status(200).end()
          })
          .catch(err => {
            // ...and here if it was not
            console.log('Error :', err)
             res.status(200).end()
          });
          return;
  }
    if (message.text.indexOf(s_loc)===0) {
    buttonTouched=true;
    earlierAction=s_loc;
    axios.post('https://api.telegram.org/bot891875030:AAGl9ik1oLZynXVFNnz581fZ1ZkOZ4d6tVI/sendMessage',
          {
            chat_id: message.chat.id,
            text: 'Enter your school location'
          })
          .then(response => {
            // We get here if the message was successfully posted
            console.log('Message posted')
             res.status(200).end()
          })
          .catch(err => {
            // ...and here if it was not
            console.log('Error :', err)
             res.status(200).end()
          })
          return;
  }    
    if (message.text.indexOf(u_pic) === 0) {
    buttonTouched=true;
    earlierAction=u_pic;
    axios.post('https://api.telegram.org/bot891875030:AAGl9ik1oLZynXVFNnz581fZ1ZkOZ4d6tVI/sendMessage',
          {
            chat_id: message.chat.id,
            text: 'Send your picture'
          })
          .then(response => {
            // We get here if the message was successfully posted
            console.log('Message posted')
            res.status(200).end()
          })
          .catch(err => {
            // ...and here if it was not
            console.log('Error :', err)
             res.status(200).end()
          })
          return;
  }
    if (message.text.indexOf(d_event) === 0) {
    buttonTouched=true;
    earlierAction=d_event;
    axios.post('https://api.telegram.org/bot891875030:AAGl9ik1oLZynXVFNnz581fZ1ZkOZ4d6tVI/sendMessage',
          {
            chat_id: message.chat.id,
            text: 'What day is it?'
          })
          .then(response => {
            // We get here if the message was successfully posted
            console.log('Message posted')
             res.status(200).end()
          })
         .catch(err => {
            // ...and here if it was not
            console.log('Error :', err)
             res.status(200).end()
          })
         return;
  }
    if (message.text.indexOf(done) === 0) {
    buttonTouched=false;
    axios.post('https://api.telegram.org/bot891875030:AAGl9ik1oLZynXVFNnz581fZ1ZkOZ4d6tVI/sendPhoto',
               {
                chat_id: message.chat.id,
                photo: pic,
                caption: 'School: '+schoolName+'\n'+'Location: '+place+'\n'+'Event: '+event
               })
               .then(response => {
                // We get here if the message was successfully posted
                console.log('Message posted')
                 res.status(200).end()
               })
               .catch(err => {
                // ...and here if it was not
                console.log('Error :', err)
                 res.status(200).end()
               }); 
     return;         
  }
        
    axios.post('https://api.telegram.org/bot891875030:AAGl9ik1oLZynXVFNnz581fZ1ZkOZ4d6tVI/sendMessage',
          {
            chat_id: message.chat.id,
            text: 'Welcome',
            reply_markup: { "keyboard": [["School name", "School location"],   ["Upload Picture"], ["Describe Event"],["Done"]] }  
          })
          .then(response => {
            // We get here if the message was successfully posted
            console.log('Message posted')
            res.status(200).end()
          })
          .catch(err => {
            // ...and here if it was not
            console.log('Error :', err)
             res.status(200).end()
          })
  
});

// Finally, start our server 8443
app.listen(process.env.PORT || 4000, function() {
  console.log('Telegram app listening on port 3000!')
})
/*bot.onText(s_name, (msg) => {
  const chatId = msg.chat.id;
  buttonTouched=s_name;
  bot.sendMessage(msg.chat.id, "Send Your school name");
});
bot.onText(s_loc, (msg) => {
  const chatId = msg.chat.id;
  buttonTouched=s_loc;
  bot.sendMessage(msg.chat.id, "Send Your school location");
});
bot.onText(u_pic, (msg) => {
  const chatId = msg.chat.id;
  buttonTouched=u_pic;
  bot.sendMessage(msg.chat.id, "Send Your the picture as a file");
});
bot.onText(d_event, (msg) => {
  const chatId = msg.chat.id;
  buttonTouched=d_event;
  bot.sendMessage(msg.chat.id, "What event does the picture represent?");
});
bot.onText(done, (msg) => {
  const chatId = msg.chat.id;
  buttonTouched="";
  bot.sendMessage(msg.chat.id, "Done");
});*/