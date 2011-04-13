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
		children: [3],
		parent: 0
	},
	2: {
		content: 'Trees must go, I agree. Major distraction.',
		parent: 0
	},
	3: {
		content: 'Try being more polite, will you? He is not a tree after all.',
		children: [4],
		parent: 1
	},
	4: {
		content: 'Huh, so you are saying humans are more important then trees? Guess who was here first.',
		children: [5],
		parent: 3
	},
	5: {
		content: 'Tree troll. Get lost.',
		parent: 4
	}
};

var clean = function(array){
	return array.filter(function(item){return item !== null;});
};

var render = function(nodes, rootId, showParent){
	var node = nodes[rootId];
	var content = node.content;
	var points = node.points || 0;
	var permalink = '<a href="/' + rootId + '">link</a>';
	var replylink = '<a href="/' + rootId + '/reply">reply</a>';
	var parentlink = typeof showParent === 'undefined' || typeof node.parent === 'undefined' ? null : '<a href="/' + node.parent + '">parent</a>';
	var upvote = '<a href="/' + rootId + '/up">up</a>';
	var downvote = '<a href="/' + rootId + '/down">down</a>';
	var children = (node.children || []).map(function(childId){
		return render(nodes, childId);
	}).join('');
	var html = '<li>' + clean([points, content, parentlink, permalink, replylink, upvote, downvote]).join(' | ') + '<ul>' + children + '</ul></li>';
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

var replyForm = '<form><textarea name="content"></textarea><br /><input type="submit" /></form>';

var server = http.createServer(function(req, res){
	var path = url.parse(req.url).pathname;
	var segments = path.slice(1).split('/');
	var query = url.parse(req.url).query;
	var param = query ? query.slice(query.indexOf('=')+1) : null;
	var rootId = segments[0];
	var action = segments[1];

	if (typeof nodes[rootId] === 'undefined'){
		res.writeHead(404);
		res.end();
		return;
	}else{
		if (typeof action === 'undefined'){
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end('<ul>' + render(nodes, rootId, true) + '</ul>');
		}else if (action === 'up'){
			upvote(nodes, rootId);
			res.writeHead(302, {'Location': req.headers.referer});
			res.end();
		}else if (action === 'down'){
			downvote(nodes, rootId);
			res.writeHead(302, {'Location': req.headers.referer});
			res.end();
		}else if (action === 'reply'){
			if (param === null){
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(replyForm);
			}else{
				var newId = Math.max.apply(this, Object.keys(nodes).map(function(num){return parseInt(num);})) + 1;
				nodes[rootId].children.push(newId);
				nodes[newId] = { content: unescape(param).replace(/\+/g, ' ') };
				res.writeHead(302, {'Location': '/' + rootId});
				res.end();
			}
		}
	}
});

server.listen(1338);

