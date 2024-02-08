var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
const cors = require('cors');


/*
* DB config
*/
const Pool = require('./routes/config/pool');
const pool = new Pool();

//global.__lib = __dirname + '/lib/';

/*
 * properties
 */
const PropertiesReader = require("properties-reader");
const properties = PropertiesReader("adm.properties");
const port = properties.get("com.server.port");

/*
* view html config
*/
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '5mb', extended: false, parameterLimit: 10000}));



//flash 미들웨어는 req 객체에 req.flash 메서드를 추가한다.
//req.flash(키,값)으로 해당키에 값을 설정하고,
//req.flsh(키)로 해당 키에 대한 값을 불러온다.
var flash = require('connect-flash');

//secret – 쿠키를 임의로 변조하는것을 방지하기 위한 sign 값 입니다. 원하는 값을 넣으면 됩니다.
//resave – 세션을 언제나 저장할 지 (변경되지 않아도) 정하는 값입니다. express-session documentation에서는 이 값을 false 로 하는것을 권장하고 필요에 따라 true로 설정합니다.
//saveUninitialized – uninitialized 세션이란 새로 생겼지만 변경되지 않은 세션을 의미합니다. Documentation에서 이 값을 true로 설정하는것을 권장합니다.
//var expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 hour
var expiryDate = new Date(Date.now() + 5 * 60 * 1000) // 5 minute
 app.use(session({
   cooke: {
       // maxAge: 30 * 24 * 60 * 60 * 1000,
        expires: expiryDate,
        httpOnly: true
    },
  resave: false,
  saveUninitialized: true,
  secret: 'cube!*Session'
})); // 세션 활성화

/*
* passport config
*/
var passport = require('passport') //passport module add
const passportConfig = require('./routes/passport'); // 여기

// flash는 세션을 필요로합니다. session 아래에 선언해주셔야합니다.
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

require('dotenv').config();

app.set('pool',pool);
passportConfig(pool);

app.use(cors());


const moment = require("moment");
const date = moment(new Date());

app.use(function(req, res, next) {

  res.locals.user = req.user;
  next();

});


app.locals.moment = require('moment');

app.use('/', require('./routes/admin'))

var server = app.listen(port,  function(){
 console.log("Express server has started on port " + port);
});

