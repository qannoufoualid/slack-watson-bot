require('dotenv').load();

const URL_XKCD_API = "https://xkcd.com/info.0.json";

var Client = require('node-rest-client').Client;
 
var client = new Client();

var Botkit = require('botkit');
var express = require('express');
var middleware = require('botkit-middleware-watson')({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  workspace_id: process.env.WORKSPACE_ID,
  url: process.env.CONVERSATION_URL || 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2017-05-26'
});

// Configure your bot.
var slackController = Botkit.slackbot();
var slackBot = slackController.spawn({
  token: process.env.SLACK_TOKEN
});

slackController.hears(['.*'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
  slackController.log('Slack message received');
  middleware.interpret(bot, message, function() {
    if (message.watsonError) {
      console.log(message.watsonError);
      bot.reply(message, message.watsonError.description || message.watsonError.error);
    } else if (message.watsonData && 'output' in message.watsonData) {
  
      if(message.watsonData.output.text[0]==="Here is the last webcomic"){
            client.get(URL_XKCD_API, function (data, response) {

                bot.reply(message, {
                    attachments:[
                            {
                            "title": "Last Webcomic",
                            "image_url": data.img,
                        }
                    ]
                });
             });
      }

      bot.api.channels.list({'exclude_archived' : 1}, function (err, res) {
          console.log(res);
      s});

      bot.reply(message, message.watsonData.output.text.join('\n'));
    } else {
      console.log('Error: received message in unknown format. (Is your connection with Watson Conversation up and running?)');
      bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
    }
  });
});


slackBot.startRTM();

sendMessageToUser("Hello Vincent im here",'UA4EMBP39');

function sendMessageToUser(message, user){

  slackBot.startPrivateConversation({ user: user }, function(err,dm) {
      dm.say(message);
  });

}




// Create an Express app
var app = express();

var port = process.env.PORT || 5000;
app.set('port', port);

app.post("/querydone", function (req, res) {

      //TODO parse res

      console.log("Working");
      res.send("Thank you kafka system");
});

app.listen(port, function() {
  console.log('Client server listening on port ' + port);
});