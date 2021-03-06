var conspiragram = conspiragram || {};

conspiragram.userScores = [];
conspiragram.processedIds = [];
conspiragram.url = "https://api.instagram.com/v1/tags/conspiragram/media/recent?client_id=fe9bac53a2bb44b49558d1297e33e046&count=10000";
conspiragram.table = $('#main > table');
conspiragram.entriesPP = 10;

conspiragram.init = function(){
    conspiragram.callInstagram([], conspiragram.url);
$('.pagination').jqPagination({
    paged: function(page) {
        conspiragram.table.empty();
        var starting = (page - 1) * conspiragram.entriesPP;
        var ending = starting + conspiragram.entriesPP;
        ending = ending >= conspiragram.userScores.length ? conspiragram.userScores.length : ending;
        for(var i = starting; i < ending; i++) {
            var userSc = conspiragram.userScores[i];
            var pointsLbl = userSc.score === 1 ? ' point' : ' points';
            conspiragram.table.append('<tr><td>'+(i+1)+'.</td><td><img src="'+userSc.pic+'" width="50"/></td><td>'+userSc.name+'</td><td>'+userSc.score+pointsLbl+'</td></tr>');
        }
    }
});
};

conspiragram.callInstagram = function(posts, nextUrl) {
    console.log(nextUrl);
    if(nextUrl != undefined) {
        $.ajax({
            type: "GET",
            dataType: "jsonp",
            cache: false,
            url: nextUrl,
            success: function(data) {
                posts = posts.concat(data.data);
                nextUrl = typeof data.pagination === 'object' ? data.pagination.next_url : undefined;
                conspiragram.callInstagram(posts, nextUrl);
            }
        });
    } else {
        posts = Enumerable.From(posts).OrderBy('parseInt($.created_time, 10)').ToArray();
        for(var i = 0, lng = posts.length; i < lng; i++) {
            var post = posts[i];
            if(!Enumerable.From(conspiragram.processedIds).Contains(post.id)) {
                var instaUser = post.user;
                var userSc = Enumerable.From(conspiragram.userScores).Where(function(x){return x.name === instaUser.username;}).FirstOrDefault();
                var target = Enumerable.From(post.caption.text.split(" ")).Where("$[0] === '@' ").FirstOrDefault();
                var time = parseInt(post.created_time, 10);
                if(typeof target === 'string') { //if there was a tagged user
                    if(typeof userSc === 'object') { //we have an entry. we edit
                        var targetBefore = userSc.targets[target];
                        if(typeof targetBefore === 'undefined' || targetBefore + 3600 <= time){
                            //if the user didn't tag the target before, or if there are at least 1h before last tag of same user
                            //then we add one to score
                            userSc.score++;
                            userSc.targets[target] = time;
                        }
                    } else { //we don't have an entry. we create new entry
                        var targets = {};
                        targets[target] = time;
                        conspiragram.userScores.push({
                            score: 1,
                            pic: instaUser.profile_picture,
                            targets: targets,
                            name: instaUser.username
                        });
                    }
                    conspiragram.processedIds.push(post.id);
                }
            }
        }
        conspiragram.userScores = Enumerable.From(conspiragram.userScores).OrderByDescending('$.score').ThenBy('$.name').ToArray();
        $('.pagination').jqPagination('option', 'current_page', 1);
        $('.pagination').jqPagination('option', 'max_page', Math.ceil(conspiragram.userScores.length / conspiragram.entriesPP));
        setTimeout(conspiragram.init, 300000);
    }
}

$(function(){
	conspiragram.init();
});