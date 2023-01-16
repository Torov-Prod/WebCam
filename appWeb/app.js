/*
'use strict';

 console.log(createRandomId());

var appConfig ={
    "port": 4450    
}

var path            = require('path');  // формирование пути в системе
var express         = require('express');
var bodyParser      = require("body-parser");
var app             = express();
var http            = require('http').Server(app);
var qs 				= require('querystring');

// подключить дирректорию public для сайта
app.use(express.static(path.join(__dirname, "public")));

// подключить возможность принятия post запросов
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
	//console.log('root request');
	res.sendFile(__dirname + '/index.html');
	console.log(req.body);
});
let myId = 1,
	imageData = "";

app.post('/photo', function (req, res) {
	let fullBody = "";
	req.on('data', function(chunk){
		fullBody += chunk.toString();
	})
	req.on('end',function(){
		res.writeHead(200, {'Content-Type':'text/html'});
		let POST = qs.parse(fullBody);
			if(POST["p"] == "new"){
				imageData = POST["text"];
				myId += 1;
				res.write(imageData);	
			}else 
			if(POST["p"] == "ajax"){
				if(myId > parseInt(POST["last"])){
					if(typeof(imageData) != "undefined"){
						res.write(document.body.innerHTML = ("<img src=" + "'" + imageData + "'" + "/>") + "\n");
						res.write("last_message_id = " + myId + ";");
					}
				}
			}
		res.end();
	});
	console.log(req.body);
});
http.listen(appConfig.port, function(){
    console.log('Express server listening on port '+appConfig.port);
});


// проверка правильности REST запроса и авторизации
function checkQuery(query, values){
	
	for(let i=0; i < values.length; i++){
		if(values[i] in query){} else {return 'error in query params';}
	}
	
	//if(('key' in query) && query.key == config.restKey){} else {return 'auth error'}
	
	return 'ok';
}
//

function createRandomId(){
    return Math.floor(Math.random() * 100000)
}*/

'use strict';

var appConfig ={
    "port": 4450    
}

var path            = require('path');  // формирование пути в системе
var express         = require('express');
var bodyParser      = require("body-parser");
var app             = express();
var http            = require('http').Server(app);
var qs 				= require('querystring');


// подключить дирректорию public для сайта
app.use(express.static(path.join(__dirname, "public")));

// подключить возможность принятия post запросов
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// грузим базу данных
var photosDatastore   = require('nedb')
,photosDb = new photosDatastore({ filename: './db/photos.db', autoload: true });

// открытие нужных страниц по запросу
app.get('/index.html', function (req, res) {
	//console.log('root request');
	res.sendFile(__dirname + '/index.html');
	console.log(req.body);
});

app.get('/watchWeb.html', function (req, res) {
	//console.log('root request');
	res.sendFile(__dirname + '/watchWeb.html');
	console.log(req.body);
});

// обработка post добавления фото в бд
app.post('/AddPhoto', function(req,res){
    let CheckQuery = checkQuery(req.body, ['text']);
  	if(CheckQuery == 'ok'){
        let a = {
            "text": req.body.text,
            "creationDate": new Date(),
        };
        photosDb.insert(a, function (err, newDoc) {
        });
        res.send({"result": "ok", "creationDate": new Date()});
  	} else {
        console.log(CheckQuery);
    	res.send(CheckQuery);
  	}
})

// обработка post отправки фото клиенту
app.post('/PushPhoto', function(req,res){
    let CheckQuery = checkQuery(req.query, []);
  	if(CheckQuery == 'ok'){
        photosDb.find({}, function (err, docs) {
			res.send(docs);
			console.log(docs);
        });
  	} else {
        console.log(CheckQuery);
    	res.send(CheckQuery);
  	}
})
// проверка правильности REST запроса и авторизации
function checkQuery(query, values){
  
	for(let i=0; i < values.length; i++){
	  if(values[i] in query){} else {return 'error in query params';}
	}
	
	//if(('key' in query) && query.key == config.restKey){} else {return 'auth error'}
	
	return 'ok';
}

// запускаем сервер
http.listen(appConfig.port, function(){
    console.log('Express server listening on port '+appConfig.port);
});
