var TweetCache = require('../tweet-cache.js');

describe("Tests for TweetCache", function() {

    it("inserts a test document", function() {
        var result = TweetCache.insert({'test' : 'testvalue1'});
        console.log(JSON.stringify(result));

    });
});