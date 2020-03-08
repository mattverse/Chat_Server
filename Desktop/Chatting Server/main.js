var express =  require('express')
    ,http = require('http')
    ,path = require('path');
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')

var expressSession = require('express-session');

var passport = require('passport');
var flash = require('connect-flash');

var config = require('./config/config');

var database = require('./database/database');

var route_loader = require('./routes/route_loader');

var socketio = require('socket.io');
var cors = require('cors');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cors());

var router = express.Router();
route_loader.init(app, router);

var configPassport = require('./config/passport');
configPassport(app, passport);

var userPassport = require('./routes/user_passport');
userPassport(router, passport);


//==================
process.on('SIGTERM', function () {
    console.log("process ending.");
    app.close();
});

app.on('close', function () {
	console.log("Express server ending");
	if (database.db) {
		database.db.close();
	}
});

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('server started in port: ' + app.get('port'));

	database.init(app, config);
   
});

var io = socketio.listen(server);

login_ids = {};

io.sockets.on('connection', function(socket) {
	console.log('connection info :', socket.request.connection._peername);

	socket.remoteAddress = socket.request.connection._peername.address;
	socket.remotePort = socket.request.connection._peername.port;

	socket.on('login', function(login) {
    	console.log('login 이벤트를 받았습니다.');
    	console.dir(login);

        // 기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log('접속한 소켓의 ID : ' + socket.id);
        login_ids[login.id] = socket.id;
        socket.login_id = login.id;

        console.log('접속한 클라이언트 ID 갯수 : %d', Object.keys(login_ids).length);

        // 응답 메시지 전송
        sendResponse(socket, 'login', '200', '로그인되었습니다.');
    });


	socket.on('message', function(message) {
    	console.log('message event recieved.');
    	console.dir(message);
    	
        if(message.recepient =='ALL') {
        	console.dir('Sending all clients message.');
            io.sockets.emit('message', message);
		}
		else {
        	// 일대일 채팅 대상에게 메시지 전달
        	if (login_ids[message.recepient]) {
        		io.sockets.connected[login_ids[message.recepient]].emit('message', message);
        		
        		// 응답 메시지 전송
                sendResponse(socket, 'message', '200', '메시지를 전송했습니다.');
        	} else {
        		// 응답 메시지 전송
                sendResponse(socket, 'login', '404', '상대방의 로그인 ID를 찾을 수 없습니다.');
        	}
        }
    })
});


// 응답 메시지 전송 메소드
function sendResponse(socket, command, code, message) {
	var statusObj = {command: command, code: code, message: message};
	socket.emit('response', statusObj);
}

