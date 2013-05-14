var conspiragram = conspiragram || {};

conspiragram.userScores = {};
conspiragram.processedIds = [];

conspiragram.init = function(){
    $.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url: "https://api.instagram.com/v1/tags/conspiragram/media/recent?client_id=fe9bac53a2bb44b49558d1297e33e046",
        success: function(data) {
        	var posts = data.data;
        	var lng = posts.length;
        	for(i = 0; i < lng; i++) {
        		var post = posts[i];
        		if(!Enumerable.From(conspiragram.processedIds).Contains(post.id)) {
        			
        			conspiragram.processedIds.push(post.id);
        		}
        	}
        }
    });
};

$(function(){
	conspiragram.init();
});