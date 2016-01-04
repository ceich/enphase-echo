/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
	This is a protoype of the Enphase Alexa skillset.  It allows users to querry information on the operation of their solar array.
 */


/**
 * App ID for the skill
 */
var APP_ID = 'amzn1.echo-sdk-ams.app.7965ade7-3b63-48de-a2dd-6480046f4645';


var https = require('https');


/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * URL prefix to to request information from the Enphase Elighten API
 * This hard-coded url should eventually be replaced with Enphase-to-Amazon "Account Linking"
 * More information can be found at this here:
 * https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/linking-an-alexa-user-with-a-user-in-your-system
 */
var urlPrefix = 'https://api.enphaseenergy.com/api/v2/systems/67/summary?key=5e01e16f7134519e70e02c80ef61b692&user_id=4d7a45774e6a41320a';

/**
 * EnphaseSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var EnphaseSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
EnphaseSkill.prototype = Object.create(AlexaSkill.prototype);
EnphaseSkill.prototype.constructor = EnphaseSkill;

EnphaseSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("EnphaseSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

EnphaseSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("EnphaseSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

EnphaseSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

EnphaseSkill.prototype.intentHandlers = {

    "GetPower": function (intent, session, response) {
        handleGetPowerRequest(intent, session, response);
    }, 
	
	"GetEnergy": function (intent, session, response) {
        handleGetEnergyRequest(intent, session, response);
    },
	
	"GetStatus": function (intent, session, response) {
        handleGetStatusRequest(intent, session, response);
    },
	
    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With Enphase, you can request i on the performance of your Enphase solar array. nformation" +
            "For example, you can ask, how much energy has my array produced in the last week?";
        var repromptText = "What do you want to know about your solar array?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */
function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "Enphase Energized";
    var repromptText = "What do you want to know about how your solar array is performing?";
    var speechText = "<p>Enphase.</p> <p> With Enphase, you can request information on the performance of your Enphase solar array. " +
            "For example, you can ask, how much energy has my array produced in the last week?  Now, what do you " + 
			"want to know about your solar array?</p>";
    var cardOutput = "Enphase. What do you want to know about your solar array?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}

/**
 * Get array power
 */
 function handleGetPowerRequest(intent, session, response){
	getJsonSummaryFromEnphase(function (solar_data) {
		var Power = solar_data.current_power;
        var speechText = "Your array is currently producing " + Power + "W.";
		var cardTitle = "Enphase solar array power production.";
		var cardContent = "This is the card content.";
        speakText = "This is the speech text."
        var speechOutput = {
			speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
        response.tellWithCard(speechOutput, cardTitle, cardContent)
    });
 }
 
 /**
 * Get array energy
 */
 function handleGetEnergyRequest(intent, session, response){
	
	var DurationSlot = intent.slots.Duration;
	var Duration = "";

	if (DurationSlot && DurationSlot.value) {
        Duration = DurationSlot.value;
    } else {
        Duration = "day";
    }
	
	getJsonSummaryFromEnphase(function (solar_data) {
		Energy = solar_data.energy_today;
		var speechText = "Your array has produced " + Energy + "Wh in the last " + Duration;
		var cardTitle = "Enphase solar array energy production.";
		var cardContent = "This is the card content.";
		speakText = "This is the speech text."
		var speechOutput = {
			speech: "<speak>" + speechText + "</speak>",
			type: AlexaSkill.speechOutputType.SSML
		};
		response.tellWithCard(speechOutput, cardTitle, cardContent)
	});
 }
 
/**
 * Gets the status of the solar array
 */
function handleGetStatusRequest(intent, session, response){
//{"system_id":67,"modules":35,
//"size_w":6650,
//"current_power":2,
//"energy_today":8913,
//"energy_lifetime":67817739,
//"summary_date":"2015-12-07",
//"source":"microinverters",
//"status":"normal",
//"operational_at":1201362300,
//"last_report_at":1449549169,
//"last_interval_end_at":1449549000}

	getJsonSummaryFromEnphase(function (solar_data) {
		var StatusStr = "";
		var ReportStr = "";
		if (solar_data.status == "normal"){
			var Power = solar_data.current_power;
			var Energy = solar_data.energy_today;
			StatusStr = "Your array is operating normally. "
			ReportStr = "It is currently producing " + Power + "watts of power. " +
			"So far it has produced " +  Energy + "Wh of energy today."
		}else {
			StatusStr = "There appears to be an issue with you array."
		}
		
		var ArraySize = solar_data.size_w;
		var speechText = StatusStr + ReportStr;
		var speechOutput = {
			speech: "<speak>" + speechText + "</speak>",
			type: AlexaSkill.speechOutputType.SSML
		};
		response.tell(speechOutput)
	});
}

function getJsonSummaryFromEnphase(eventCallback){
	var url = urlPrefix;
	https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = JSON.parse(body);
            eventCallback(stringResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HistoryBuff Skill.
    var skill = new EnphaseSkill();
    skill.execute(event, context);
};