var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');

var url = 'mongodb://localhost:27017/packettweets';

var TweetCache = {

    insert: function (document, callback) {
        console.log('insert: ' + JSON.stringify(document));
        MongoClient.connect(url).then(function (db) {

            //add $lt 30 mins to search
            document.$lt = {lastTweet: moment().subtract(12, 'hours').calendar()};

            db.collection('tweets').findOne(document).then(function (olderResult) {
                console.log("findOne older than 12 hours, result: " + JSON.stringify(olderResult));
                var updateProperties = {};
                var now = new Date();

                if (olderResult != null) {
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
                    callback(response);
                });
            });
        });
    }
}

module.exports = TweetCache;


