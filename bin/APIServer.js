
var express = require('express');
var app = express();
app.set('port', 3000);

app.get('/', function(req, res) {
	res.send('Hello, link-edu.com');
});

app.listen(app.get('port'), function() {
	console.log('express start listening on port 3000');
});