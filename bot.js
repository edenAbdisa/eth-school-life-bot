const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express')
const bodyParser = require('body-parser');
require('dotenv').config();

const { Client } = require('pg');
const token = process.env.TELEGRAM_TOKEN;
let bot;


const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
 
client.connect();


if (process.env.NODE_ENV === 'production') {
   bot = new TelegramBot(token);
   bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
   bot = new TelegramBot(token, { polling: true });
}
var buttonTouched=false;
var earlierAction="";
var schoolName="";
var place="";
var event="";
var pic;
var photoId;
var picture;
var s_name = "School name";  
var s_loc = "School location";  
var u_pic = "Upload Picture";  
var d_event = "Describe Event";
var done = "Done";
var picmsg;
/*
create Table FireTable( id text primary key ,userId text ,postId text );
create Table LikeTable( id text primary key ,userId text ,postId text );
create Table PostRateNumber( postId text primary key ,fireNumber integer ,likeNumber integer);
*/
//connect to the database 

bot.on('message',(message)=>{
	//const  message  = msg.text 
  if(message.text===""){
  	bot.sendMessage(message.chat.id, "Message cant be empty send /start to start");
  	return;
  }
  if (message.text && message.text === "/start"){
  	
  	bot.sendMessage(message.chat.id, "Welcome ,Press the buttons to send the message that you want \n Once you are done touch the done button which will directly post the picture on the channel."
  		, {
  			"reply_markup": {
    	                      "keyboard": [["School name", "School location"],   ["Upload Picture"], ["Describe Event"],["Done"]]
          }
        });
  	return;
  }
  if(buttonTouched){
    switch(earlierAction){
      case s_name:
        schoolName= message.text;
        buttonTouched=false;
        break;
      case s_loc:
        place= message.text;
        buttonTouched=false;
        break;
      case u_pic:
        pic=message.photo[1].file_id; 
        buttonTouched=false;
        break;
      case d_event:
        event= message.text;
        buttonTouched=false;
        break;
    }
    return;
  }
  if (message.text===s_name) {
    buttonTouched=true;
    earlierAction=s_name;
    bot.sendMessage(message.chat.id,'Send your school name.');
    return;
  }
  if (message.text===s_loc) {
    buttonTouched=true;
    earlierAction=s_loc;
    bot.sendMessage(message.chat.id,'Enter your school location.');
    return;
  }    
  if (message.text===u_pic) {
    buttonTouched=true;
    earlierAction=u_pic;
    bot.sendMessage(message.chat.id,'Send your picture.');
    return;
  }
   if (message.text===d_event) {
    buttonTouched=true;
    earlierAction=d_event;
    bot.sendMessage(message.chat.id,'Describe your event.');
    return;
  }
 
  if (message.text===done) {
     
    bot.sendPhoto('@Trial_eth_school',pic,{caption : '🏢  School: '+schoolName+'\n'+'🇪🇹  Event: '+event+'\n'+'📌 Location: '+place+'\n'+"................."+'\n'+"@Schoolies" 
    	 , "reply_markup": {
            "inline_keyboard": [
                [
                    {
                        text: "❤️ 0",
                        callback_data: 'heart'
                    },
                    {
                        text: "🔥 0",
                        callback_data: 'fire'
                    }
                ]
            ]
           }
       }
    ).then(response => {
          picmsg=response.message_id
          client.query("Insert Into PostRateNumber ( postid,fireNumber,likeNumber) values ( '" + picmsg.toString()+"', 0, 0 ) ;", (err, res) => {
            if (err) console.log("check the error"+ err); 
          
          });
    }); 
      
    
    buttonTouched=false;     
    earlierAction="";
 	schoolName="";
	place="";
	event="";
	pic="";
    return;
  }

 });


bot.on("callback_query", (callbackQuery) => {
	 var heartLiked=0;
	 var fireLiked=0;
   const msg = callbackQuery.message;
    const userId = callbackQuery.from.id; 
    const action = callbackQuery.data;    
    const msgId = callbackQuery.message.message_id;
    
  
    client.query("SELECT * FROM PostRateNumber where postId = '"+ msgId.toString() +"' ;", (err, res) => {
            if (err) throw err;            
              var postRate =JSON.parse(JSON.stringify(res.rows[0])); 

              heartLiked=parseInt(postRate.likenumber,10);
              fireLiked=parseInt(postRate.firenumber,10); 
        
    });
    if(action==="heart"){
      client.query( "SELECT * FROM LikeTable where userId= '"+ userId.toString() +"' and postId = '"+ msgId.toString() +"' ;", (err, res) => {
        if (err) throw err;
        if (res.rowCount > 0){
          client.query("Delete FROM LikeTable where userId='"+ userId.toString() +"' and postId = '"+ msgId.toString() +"' ;", (err, res) => {
            if (err) throw err;
             });
            if(heartLiked>=1){
              heartLiked--;
              bot.editMessageReplyMarkup(   { inline_keyboard:  [
                                                              [
                                                                  {
                                                                      text: `❤️  ${heartLiked}`,
                                                                      callback_data: "heart"
                                                                  },
                                                                  {
                                                                      text: `🔥 ${fireLiked}`,
                                                                      callback_data: "fire"
                                                                  }
                                                              ]
                                                            ]           
   },{"message_id":callbackQuery.message.message_id,"chat_id": '@Trial_eth_school'});
              client.query(`UPDATE PostRateNumber SET likeNumber = ${heartLiked} where postId = '`+ msgId.toString() +"';", (err, res) => {
              if (err) throw err;            
              });
            }
         
        }
        else {
          client.query("Insert Into LikeTable (id,userId,postId) values ('"+userId.toString()+msgId.toString()+"', '"+userId.toString()+"', '"+msgId.toString()+"') ;", (err, res) => {
            if (err) console.log( err);
              });
             heartLiked++;
             bot.editMessageReplyMarkup(   { inline_keyboard:  [
                                                              [
                                                                  {
                                                                      text: `❤️  ${heartLiked}`,
                                                                      callback_data: "heart"
                                                                  },
                                                                  {
                                                                      text: `🔥 ${fireLiked}`,
                                                                      callback_data: "fire"
                                                                  }
                                                              ]
                                                            ]           
   },{"message_id":callbackQuery.message.message_id,"chat_id": '@Trial_eth_school'});
            client.query(`UPDATE PostRateNumber SET likeNumber = ${heartLiked} where postId = '`+msgId.toString() +"' ;", (err, res) => {
            if (err) throw err;            
            });
        
        } 
      }); 
        
    

    
 
        
    }else if(action==="fire"){
    	client.query( "SELECT * FROM FireTable where userId= '"+ userId.toString() +"' and postId = '"+ msgId.toString() +"' ;", (err, res) => {
        if (err) throw err;
        if (res.rowCount > 0){
          client.query("Delete FROM FireTable where userId='"+ userId.toString() +"' and postId = '"+ msgId.toString() +"' ;", (err, res) => {
            if (err) throw err;            
          });
          if(fireLiked>=1){
            fireLiked--;
            bot.editMessageReplyMarkup(   { inline_keyboard:  [
                                                              [
                                                                  {
                                                                      text: `❤️  ${heartLiked}`,
                                                                      callback_data: "heart"
                                                                  },
                                                                  {
                                                                      text: `🔥 ${fireLiked}`,
                                                                      callback_data: "fire"
                                                                  }
                                                              ]
                                                            ]           
   },{"message_id":callbackQuery.message.message_id,"chat_id": '@Trial_eth_school'});
            client.query(`UPDATE PostRateNumber SET fireNumber = ${fireLiked} where postId = '`+ msgId.toString() +"';", (err, res) => {
              if (err) throw err;            
            });
          }
        }
        else {
          client.query("Insert Into FireTable (id,userId,postId) values ('"+userId.toString()+msgId.toString()+"', '"+userId.toString()+"', '"+msgId.toString()+"') ;", (err, res) => {
            if (err) throw err;
          });
          fireLiked++;          
          bot.editMessageReplyMarkup(   { inline_keyboard:  [
                                                              [
                                                                  {
                                                                      text: `❤️  ${heartLiked}`,
                                                                      callback_data: "heart"
                                                                  },
                                                                  {
                                                                      text: `🔥 ${fireLiked}`,
                                                                      callback_data: "fire"
                                                                  }
                                                              ]
                                                            ]           
   },{"message_id":callbackQuery.message.message_id,"chat_id": '@Trial_eth_school'});
          client.query(`UPDATE PostRateNumber SET fireNumber = ${fireLiked} where postId = '`+msgId.toString() +"' ;", (err, res) => {
            if (err) throw err;            
          });
        } 
      }); 
        
    }
    
   
    }); 

const app = express();

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});