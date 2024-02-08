const path = require('path');
const router = require('express').Router()

var passport = require('passport');
const order = require('./order.controller')

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();

    let alertMessage = {};
    alertMessage.message = "로그인후 가능합니다.";
    req.flash("alertMessage", alertMessage);
    res.redirect('/login');
};

router.get('/view', isAuthenticated, order.view);
router.post('/view', isAuthenticated, order.view);


router.post('/order', isAuthenticated, order.view);

module.exports = router