const path = require('path');
const router = require('express').Router()

var passport = require('passport');
const po = require('./po.controller')
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

router.get('/view', isAuthenticated, po.view);
router.post('/view', isAuthenticated, po.view);

module.exports = router