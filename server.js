// set up
var express = require('express');
var app = express();
var mysql = require('mysql');

// configuration
var LISTEN_PORT = 1337;
var dbCon = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'recon',
});

app.configure(function () {
	app.use(express.static(__dirname + '/public'));
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
});

// boot
dbCon.connect(function (err) {
	if (err) {
		console.err(err);
		return false;
	}

	console.info('database connection established');
});

app.listen(LISTEN_PORT);
console.info('app listening on port', LISTEN_PORT);
