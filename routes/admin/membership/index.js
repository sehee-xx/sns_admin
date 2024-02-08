const path = require('path');
const router = require('express').Router()

var passport = require('passport');
const mem = require('./mem.controller')
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

router.get('/mview', isAuthenticated, mem.view);
router.post('/mview', isAuthenticated, mem.view);

router.get('/agent', isAuthenticated, mem.agent);
router.post('/agent', isAuthenticated, mem.agent);

router.post('/signupProc', isAuthenticated, mem.signupProc);

router.post('/adminProc', isAuthenticated, mem.adminProc);
router.post('/adminModify', isAuthenticated, mem.adminModify);

router.post('/memStopProc', isAuthenticated, mem.memStopProc);
router.post('/productView', isAuthenticated, mem.productView);



router.post('/setMA', isAuthenticated, mem.setMA);
router.post('/getMAPList', isAuthenticated, mem.getMAPList);

module.exports = router