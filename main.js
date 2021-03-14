require('dotenv').config();
var express     = require('express');
var app         = express();
var cors        = require('cors');
var bodyParser  = require('body-parser');
const port      = process.env.PORT;
var migrate     = require('./run-migration.js');
var path        = require("path");

// RUN migrations
migrate([
    {
        name: 'MakeTaskTable',
        query: `CREATE TABLE IF NOT EXISTS tasks ( 
                    id INT NOT NULL AUTO_INCREMENT,
                    description TEXT NOT NULL,
                    name VARCHAR(250) NOT NULL,
                    email VARCHAR(250) NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    block_pending INT NOT NULL DEFAULT 0,
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME NOT NULL,
                    deleted_at DATETIME,
                    PRIMARY KEY (id)
                 ) ENGINE=InnoDB;`
    }
]);



app.use(bodyParser.json({limit : "50mb"})); // support json encoded bodies
app.use(bodyParser.urlencoded({ limit : "50mb", extended: true })); // support encoded bodies
app.use(cors({
     origin: "*",
     methods: ['GET', 'PUT', 'POST', 'DELETE'],
     allowedHeaders : ['Origin', 'X-Requested-With', 'content-type', 'Authorization', 'Token', 'Folder']
}));
process.env.USER_KEY = 12345;

app.set('port',port);

app.listen(port, function(){
	console.log('Start Server - '+ new Date().toUTCString());
});

var apiRoute = require('./routes/ApiRoute.js');
app.use('/api', apiRoute);


app.get('/',function(req,res){  
    res.sendFile(path.join(__dirname+'/front/index.html')); 
});

app.use(express.static(__dirname + '/front/'));