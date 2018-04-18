require('dotenv').load();

const PRODUCER_API_URL = "http://localhost:8080/kafka-rest-json-producer/api/produce";

var Client = require('node-rest-client').Client;
var client = new Client();

var Botkit = require('botkit');
var express = require('express');
var bodyParser = require('body-parser')

var middleware = require('botkit-middleware-watson')({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  workspace_id: process.env.WORKSPACE_ID,
  url: process.env.CONVERSATION_URL || 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2017-05-26'
});
var users = [];
// Configure your bot.
var slackController = Botkit.slackbot();
var slackBot = slackController.spawn({
  token: process.env.SLACK_TOKEN
});

slackController.hears(['.*'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
  slackController.log('Slack message received');
  users.push(message.user);
  middleware.interpret(bot, message, function() {
    if (message.watsonError) {
      console.log(message.watsonError);
      bot.reply(message, message.watsonError.description || message.watsonError.error);
    } else if (message.watsonData && 'output' in message.watsonData) {
  
      bot.reply(message, message.watsonData.output.text.join('\n'));

      if(message.watsonData.output.action === "all_employees"){
            var employee_id = message.watsonData.employee_id;

            // set content-type header and data as json in args parameter 
            var args = {
                data: {
                  "url" : "http://localhost:5000/querydone",
                  "action" : "all_employees",
                  "client_id" : message.user
                },
                headers: { "Content-Type": "application/json" }
            };
             
            client.post(PRODUCER_API_URL, args, function (data, response) {
                // parsed response body as js object 
                console.log(data);
            });

             console.log("message sent to producer");
      }

      
    } else {
      console.log('Error: received message in unknown format. (Is your connection with Watson Conversation up and running?)');
      bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
    }
  });
});


slackBot.startRTM();


function sendMessageToUser(message, user){

  slackBot.startPrivateConversation({ user: user }, function(err,dm) {
    console.error(user);
      dm.say(message);
  });

}



// Create an Express app
var app = express();
app.use( bodyParser.json() );

var port = process.env.PORT || 5000;
app.set('port', port);

app.post("/querydone", function (req, res) {

      console.log("inside querydone");
      console.log(req.body);
      
      sendMessageToUser(req.body.response, req.body.client_id);

      res.send("Thank you kafka system");
});

app.listen(port, function() {
  console.log('Client server listening on port ' + port);
});