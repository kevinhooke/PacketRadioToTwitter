var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');

var url = 'mongodb://localhost:27017/packettweets';

var TweetCache = {

    insert: function (document, callback) {
        console.log('insert: ' + JSON.stringify(document));
        MongoClient.connect(url).then(function (db) {

            //search for whether this packet was last tweeted more than 12 hours ago
            var lastTweetedBeforeDateToAvoidDuplicates = moment().utc().subtract(12, 'hours').toDate();
            console.log("Checking for lastTweet before: " + lastTweetedBeforeDateToAvoidDuplicates);
            document.lastTweet = {'$lt' : lastTweetedBeforeDateToAvoidDuplicates};
            console.log("findOne query: " + JSON.stringify(document));
            db.collection('tweets').findOne(document).then(function (olderResult) {
                console.log("findOne older than 12 hours, result: " + JSON.stringify(olderResult));
                var updateProperties = {};
                var now = new Date();
                var sendTweet = false;

                if (olderResult != null) {
                    sendTweet = true;
                    updateProperties = {
                        lastHeard: now,
                        lastTweet: now
                    };
                }
                else {
                    updateProperties = {
                        lastHeard: now
                    };
                }

                db.collection('tweets').update(
                    document,
                    {
                        $set: updateProperties,
                        $inc: {heardTimes: 1},
                        $setOnInsert: {
                            firstHeard: now,
                            lastTweet: now
                        }
                    },
                    {upsert: true}
                ).then(function (response) {
                    //TODO: return flag indicating whether we need a new tweet or not
                    //tweet if new packet received
                    //tweet if duplicate but older than the TTL
                    //otherwise, no tweet

                    if(response.upserted != null || sendTweet) {
                        response.sendTweet = true;
                    }
                    else{
                        response.sendTweet = false;
                    }
                    callback(response);
                });
            });
        });
    }
}

module.exports = TweetCache;


