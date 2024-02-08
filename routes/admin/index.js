
const path = require('path');
const router = require('express').Router()
var passport = require('passport');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const errorController = require("./error.controller.js");
let isNullOrEmpty = require('is-null-or-empty');


router.get('/', function (req, res,next) {
  if (req.user) {
    res.redirect('/m/mview');
  }else{
    console.log(" ~~")
    let basicInfo = {};
    basicInfo.rtnUrl = "login";
    req.basicInfo = basicInfo;
    next();
  }
});



router.get('/login', function (req, res,next) {
    if (req.user) {
      res.redirect('/m/mview');
    }else{
  
      let basicInfo = {};
      basicInfo.rtnUrl = "login";
      req.basicInfo = basicInfo;
      next();
    }
  });


  router.post("/signin", (req, res, next) => {
  
    passport.authenticate("signin", (authError, user, info) => {
      if (authError) {
        // 에러면 에러 핸들러로 보냅니다
        console.log(authError);
        return next(authError);
      }
  
      return req.login(user, async (loginError) => {

        if (loginError) {
          let alertMessage = {};
          alertMessage.message = info.message;
          req.flash("alertMessage", alertMessage);
          return res.redirect('/login');
        }
        let pool = req.app.get("pool");
        let mydb = new Mydb(pool);

        mydb.executeTx(async (conn) => {
          let memInfo = await fnGetMemInfoById(req.user.memId, conn);
          if(memInfo.length > 0){
            if(memInfo[0].admin_yn == 'Y') {
              return res.redirect(307, "/m/mview");
            } else {
              let alertMessage = {};
              alertMessage.message = "잘못된 접근 입니다.";
              req.flash("alertMessage", alertMessage);
              return res.redirect('/logout');
            }
          } else {
            let alertMessage = {};
            alertMessage.message = "회원 정보가 없습니다.";
            req.flash("alertMessage", alertMessage);
            return res.redirect('/logout');
          }
        });
      });
    })(req, res, next);
  });
  
  router.post("/logout", function (req, res) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
      });
    });
    
    router.get("/logout", function (req, res) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
      });
    });


router.use('/s', require('./setting'))
router.use('/m', require('./membership'))

router.use('/pr', require('./product'))

router.use('/api', require('./api'))

router.use(function (req, res, next) {

  console.log(" start ~~")
  let basicInfo = req.basicInfo;

  let alertMessage = {};
  alertMessage.success = "";
  alertMessage.message = "";
  try {
    if (basicInfo != undefined) {
      let rtnUrl = basicInfo.rtnUrl;
      let flashMessage = req.flash("alertMessage");
  
      if (flashMessage.length > 0) {
        alertMessage.message = flashMessage[0].message;
      }
      console.log(rtnUrl)
      res.render(rtnUrl, { basicInfo: basicInfo, alertMessage: alertMessage });
    } else {
      //console.log(req)
      // if(!req.user) {
      //   next()
      // } else {
      //   console.log(req.url)
      //   return res.redirect(307, req.url);
      // }
      //res.send("text")
      next()
    }
  } catch (e) {
    console.log('error' , e);
    if (e instanceof SyntaxError) {
      console.log("SyntaxError");
      next(e);
    } else if (e instanceof TypeError) {
      console.log("TypeError");
      next(e);
    } else {
      res.render(rtnUrl, { basicInfo: basicInfo, alertMessage: alertMessage });
    }
  }
});

router.use(errorController.pageNotFoundError);
router.use(errorController.respondInternalError);

module.exports = router


function fnGetMemInfoById(memId, conn) {
  return new Promise(function (resolve, reject) {
      let sql = " SELECT "
          sql +=      " tm.admin_yn "
          sql += " FROM tb_membership tm "
          sql += " where 1=1 "
          
          if (!isNullOrEmpty(memId)) {
              sql += " and tm.mem_id = '"+memId+"' "
          }
         
      // console.log('fnGetMemInfoById :>> ', sql);
      conn.query(sql, (err, ret) => {
          if (err) {
              console.log(err)
              reject(err)
          }
          resolve(ret);
      });
  });
}

