var conspiragram = conspiragram || {};

conspiragram.userScores = {};
conspiragram.processedIds = [];

conspiragram.init = function(){
    var posts = [];
    var nextUrl = "https://api.instagram.com/v1/tags/conspiragram/media/recent?client_id=fe9bac53a2bb44b49558d1297e33e046&count=10000";
    conspiragram.callInstagram(posts, nextUrl);
};

conspiragram.callInstagram = function(posts, nextUrl) {
    console.log(nextUrl);
    if(nextUrl != null) {
        $.ajax({
            type: "GET",
            dataType: "jsonp",
            cache: false,
            url: nextUrl,
            success: function(data) {
                posts = posts.concat(data.data);
                nextUrl = typeof data.pagination === 'object' ? data.pagination.next_url : null;
                conspiragram.callInstagram(posts, nextUrl);
            }
        });
    } else {
        posts = Enumerable.From(posts).OrderBy('parseInt($.created_time, 10)').ToArray();
        var lng = posts.length;
        for(i = 0; i < lng; i++) {
            var post = posts[i];
            if(!Enumerable.From(conspiragram.processedIds).Contains(post.id)) {
                var instaUser = post.user;
                var userSc = conspiragram.userScores[instaUser.username];
                var target = Enumerable.From(post.caption.text.split(" ")).Where("$[0] === '@' ").FirstOrDefault();
                var time = parseInt(post.created_time, 10);
                if(typeof target === 'string') { //if there was a tagged user
                    if(typeof userSc === 'object') { //we have an entry. we edit
                        var targetBefore = userSc.targets[target];
                        if(typeof targetBefore === 'undefined' || targetBefore + 86400 <= time){
                            //if the user didn't tag the target before, or if there are at least 24h before last tag of same user
                            //then we add one to score
                            userSc.score++;
                            userSc.targets[target] = time;
                        }
                    } else { //we don't have an entry. we create new entry
                        var targets = {};
                        targets[target] = time;
                        conspiragram.userScores[instaUser.username] = {
                            score: 1,
                            pic: instaUser.profile_picture,
                            targets: targets
                        };
                    }
                    conspiragram.processedIds.push(post.id);
                }
            }
        }
        console.log(conspiragram.userScores);
        console.log(conspiragram.processedIds);
    }
}

$(function(){
	conspiragram.init();
});