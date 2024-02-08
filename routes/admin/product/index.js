const path = require('path');
const router = require('express').Router()

var passport = require('passport');
const pr = require('./pr.controller')
const rtnUtil    = require(path.join(process.cwd(),'/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(),'/routes/services/logUtil'))
const multer = require("multer");
const moment = require('moment');

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();

    let alertMessage = {};
    alertMessage.message = "로그인후 가능합니다.";
    req.flash("alertMessage", alertMessage);
    res.redirect('/login');
};

const Storage = multer.diskStorage({
	destination: function (req, file, cb) {
    console.log(file)
		const dir = "./public/upload/";
		cb(null, dir);
	},

	filename: (req, file, callback) => {
		callback(null, moment().format("YYYYMMDDHHmmss") + "-" + file.originalname);
	},
});


const upload = multer({ 
    storage: Storage,
});


router.get('/view', isAuthenticated, pr.view);
router.post('/view', isAuthenticated, pr.view);


router.get('/sell', isAuthenticated, pr.sell);
router.post('/sell', isAuthenticated, pr.sell);
router.post('/productAdd', isAuthenticated, pr.product_add);

router.get('/category', isAuthenticated, pr.category);
router.post('/category', isAuthenticated, pr.category);
router.post('/categoryAdd', isAuthenticated, pr.categoryAdd);

router.post('/upload', upload.single('file'), function(req, res) {
  res.json({
    "location": '/upload/' + req.file.filename
  });
});

router.post('/fileUpload', upload.single('file'), function(req, res) {
  console.log(req.file)
  res.json({
    "location": '/upload/' + req.file.filename
  });
});


module.exports = router