var OAuth = require("oauth");
var ax25 = require("ax25");

//load config from file
var config = require("./config/config.json");

//check for required values
var configComplete = true;
if(config.serialport == ""){
    console.log("config.json: serialport value is missing");
    configComplete = false;
}
if(config.sendTweetEnabled == undefined || config.sendTweetEnabled == ""){
    console.log("config.json: sendTweetEnabled value is missing - set to true | false");
    configComplete = false;
}
if(config.twitterConsumerKey == ""){
    console.log("config.json: twitterConsumerKey value is missing");
    configComplete = false;
}
if(config.twitterSecretKey == ""){
    console.log("config.json: twitterSecretKey value is missing");
    configComplete = false;
}
if(config.accessToken == ""){
    console.log("config.json: accessToken value is missing");
    configComplete = false;
}
if(config.accessTokenSecret == ""){
    console.log("config.json: accessTokenSecret value is missing");
    configComplete = false;
}
if(!configComplete){
    process.exit(1);
}
else{
    console.log("config.json read successfully");
    console.log("... connecting to TNC on: " + config.serialport);
    console.log("... config.sendTweetEnabled: " + config.sendTweetEnabled)
}

var oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    config.twitterConsumerKey,
    config.twitterSecretKey,
    '1.0A',
    null,
    'HMAC-SHA1'
);

var tnc = new ax25.kissTNC(
    {	serialPort : config.serialport,
        baudRate : 9600
    }
);

tnc.on("frame",
    function(frame) {
        //console.log("Received AX.25 frame: " + frame);
        var packet = new ax25.Packet({ 'frame' : frame });

        if(packet.infoString != ""){
            console.log(">  " + packet.infoString);
        }

        var status = ({
            'status' : 'Received station: '
                + formatCallsign(packet.sourceCallsign, packet.sourceSSID)
                + ' sending to: '
                + formatCallsign(packet.destinationCallsign, packet.destinationSSID)
                + ' : '
                + packet.infoString
        });

        console.log(new Date() + status);

        if(config.sendTweetEnabled == "true") {
            oauth.post('https://api.twitter.com/1.1/statuses/update.json',
                config.accessToken,
                config.accessTokenSecret,
                status,
                function (error, data) {
                    console.log('\nPOST status:\n');
                    console.log(error || data);
                });
        }
        else{
            console.log("config.sendTweetEnabled: false, status: " + JSON.stringify(status));
        }
    }
);



// //GET /search/tweets.json
// oauth.get(
//     'https://api.twitter.com/1.1/search/tweets.json?q=%40twitterapi',
//     config.accessToken,
//     config.accessTokenSecret,
//     function (e, data, res){
//         if (e) console.error(e);
//         console.log(data);
//     });

//test post
// oauth.post(
//     'https://api.twitter.com/1.1/statuses/update.json?status=Test%20post%20from%20nodejs',
//     config.accessToken, //test user token
//     config.accessTokenSecret, //test user secret
//     function (e, data, res){
//         if (e) console.error(e);
//         console.log(data);
//     });


/**
 * Formats a callsign optionally including the ssid if present
 */
function formatCallsign(callsign, ssid){
    var formattedCallsign = "";
    if(ssid == "" || ssid == "0"){
        formattedCallsign = callsign;
    }
    else{
        formattedCallsign = callsign + "-" + ssid;
    }
    return formattedCallsign;
}
