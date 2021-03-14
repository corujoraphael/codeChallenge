var mysql   = require('mysql');
var connection 	= null;
var count_calls = 0;

var connectionParams = {
	host     	: process.env.DB_HOST,
	user     	: process.env.DB_USER,
	password 	: process.env.DB_PASSWORD,
	database 	: process.env.DB_DATABASE,
	dateStrings : true
};

function DataBaseConnection() {
	this.getConnection = function(){
		if (connection == null){
			count_calls++;
			console.log("Start connection");
			connection = mysql.createConnection(connectionParams);
			connection.connect(function(err){
				console.log(!err ? 
					("Database is connected ... "+count_calls) : 
					("Error connecting database ... "+count_calls)
				);
			});
		}
		return connection;
	};

	this.closeConnection = function(){
		if ( connection ){
			count_calls++;
			connection.end(function(err) {

				if(!err) {
					console.log("Connection is teminated ... "+count_calls);    
					connection = null;
				} else {
					console.log("Error teminated connection ... "+count_calls);    
				}
			});
		}
	};
}

module.exports = DataBaseConnection;