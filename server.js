var http = require('http');
//var redis = require('redis');
var url = require('url');

var nodes = {
	0: {
		content: 'I hate trees',
		children: [1,2]
	},
	1: {
		content: 'I hate you',
		children: [3]
	},
	2: {
		content: 'Trees must go, I agree. Major distraction.',
		children: []
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
		content: 'Tree troll. Get lost.',
		children: []
	}
};

var render = function(nodes, rootId){
	var node = nodes[rootId];
	var content = node.content;
	var permalink = '<a href="/' + rootId + '">link</a>';
	var children = node.children.map(function(childId){
		return render(nodes, childId);
	}).join('');
	var html = '<li>' + [content, permalink].join(' | ') + '<ul>' + children + '</ul></li>';
	return html;
};

var server = http.createServer(function(req, res){
	var path = url.parse(req.url).pathname;
	var rootId = path.slice(1);
	
	if (typeof nodes[rootId] === 'undefined'){
		res.writeHead(404);
		res.end();
		return;
	}else{
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end('<ul>' +render(nodes, rootId) + '</ul>');	
	}
});

server.listen(1338);
