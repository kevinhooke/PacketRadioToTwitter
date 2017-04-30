var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/packettweets';

var TweetCache = {

    insert: function (document) {
        console.log('insert: ' + JSON.stringify(document));
        MongoClient.connect(url, function (err, db) {
            db.collection('tweets').update(
                document,
                {
                    $set: {
                        lastHeard: new Date()
                    },
                    $inc: {heardTimes: 1},
                    $setOnInsert: {
                        firstHeard: new Date()
                    }
                },
                {upsert: true}
            ).then(function (result) {
                console.log('result: ' + JSON.stringify(result));
                db.close();
            });
        });
    }
};
module.exports = TweetCache;


