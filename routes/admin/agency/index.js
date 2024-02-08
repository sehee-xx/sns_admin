const path = require('path');
const router = require('express').Router()

var passport = require('passport');
const ag = require('./ag.controller')
const rtnUtil    = require(path.join(process.cwd(),'/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(),'/routes/services/logUtil'))

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();

    let alertMessage = {};
    alertMessage.message = "로그인후 가능합니다.";
    req.flash("alertMessage", alertMessage);
    res.redirect('/login');
};

router.get('/view', isAuthenticated, ag.view);
router.post('/view', isAuthenticated, ag.view);

router.post('/bonus', isAuthenticated, ag.bonus);

router.post('/getAgent', isAuthenticated, ag.getAgent);

router.post('/getDepthAgent', isAuthenticated, ag.getDepthAgent);

router.post('/setAgent', isAuthenticated, ag.setAgent);

router.post('/delAgent', isAuthenticated, ag.delAgent);

router.post('/uptModyAgent', isAuthenticated, ag.uptModyAgent);

//상품 리스트
router.post('/setAP', isAuthenticated, ag.setAP);
router.post('/getAPList', isAuthenticated, ag.getAPList);

router.post('/productView', isAuthenticated, ag.productView);


module.exports = router
