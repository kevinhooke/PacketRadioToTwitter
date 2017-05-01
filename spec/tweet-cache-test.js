var TweetCache = require('../tweet-cache.js');

describe("Tests for TweetCache", function() {

    it("inserts a test document", function() {
        console.log('test called...');
        TweetCache.insert({'test' : 'testvalue1'}, function(result){
            console.log("result: " + JSON.stringify(result))
        });
    });
});