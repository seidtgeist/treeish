var http = require('http');
//var redis = require('redis');
var url = require('url');

var nodes = {
	0: {
		content: 'I hate trees',
		children: [1,2],
		points: -1
	},
	1: {
		content: 'I hate you',
		children: [3]
	},
	2: {
		content: 'Trees must go, I agree. Major distraction.'
	},
	3: {
		content: 'Try being more polite, will you? He is not a tree after all.',
		children: [4]
	},
	4: {
		content: 'Huh, so you are saying humans are more important then trees? Guess who was here first.',
		children: [5]
	},
	5: {
		content: 'Tree troll. Get lost.'
	}
};

var render = function(nodes, rootId){
	var node = nodes[rootId];
	var content = node.content;
	var points = node.points || 0;
	var permalink = '<a href="/' + rootId + '">link</a>';
	var upvote = '<a href="/' + rootId + '/up">up</a>';;
	var downvote = '<a href="/' + rootId + '/down">down</a>';;
	var children = (node.children || []).map(function(childId){
		return render(nodes, childId);
	}).join('');
	var html = '<li>' + [points, content, permalink, upvote, downvote].join(' | ') + '<ul>' + children + '</ul></li>';
	return html;
};

var upvote = function(nodes, rootId){
	if (typeof nodes[rootId].points === 'undefined') nodes[rootId].points = 0;
	nodes[rootId].points++;
};

var downvote = function(nodes, rootId){
	if (typeof nodes[rootId].points === 'undefined') nodes[rootId].points = 0;
	nodes[rootId].points--;
};

var server = http.createServer(function(req, res){
	var path = url.parse(req.url).pathname;
	var segments = path.slice(1).split('/');
	var rootId = segments[0];
	var action = segments[1];

	if (typeof nodes[rootId] === 'undefined'){
		res.writeHead(404);
		res.end();
		return;
	}else{
		if(typeof action === 'undefined'){
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end('<ul>' + render(nodes, rootId) + '</ul>');	
		}else if(action === 'up'){
			upvote(nodes, rootId);
			res.writeHead(302, {'Location': req.headers.referer});
			res.end();
		}else if(action === 'down'){
			downvote(nodes, rootId);
			res.writeHead(302, {'Location': req.headers.referer});
			res.end();
		}
	}
});

server.listen(1338);
