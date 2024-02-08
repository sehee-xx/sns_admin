const moment = require('moment');
var date = new Date()


var logUtil = {};
var SQL_LOG_VIEW = true;

logUtil.isView = function(st) {
  SQL_LOG_VIEW = st;
}

logUtil.logStart = function(msg){
  console.log("\n\n")
  console.log("=====log "+msg+" start======") 
};

logUtil.logEnd = function(msg){
  console.log("\n\n")
  console.log("=====log "+msg+" end======") 
};

logUtil.logMsg = function(req, title, msg){
  console.log("\n\n")
  try {
    let logKey = req.user.memId
    console.log(logKey,"-",moment(date).format('YYYY MM DD HH:mm:ss') , "\n", "==="+title+"===","\n", msg,"\n\n")
  } catch (error) {
    //console.log(error)
    console.log(moment(date).format('YYYY MM DD HH:mm:ss') , "\n", "==="+title+"===","\n", msg,"\n\n")
  }
};

logUtil.logStr = function(title,msg,data){
  console.log("\n\n")
  console.log("=====log "+title+" start======") 
  console.log(msg)
  console.log(data)
  console.log("=====log "+title+" end======") 
};

logUtil.errObj = function(title,err){
  console.log("\n\n")
  console.log("=====log "+title+" start======") 
  let log = {
    code : err.code,
    message : err.message
  }
  console.log(log)
  console.log("=====log "+title+" end======") 
};

logUtil.logObj = function(title,data){
  console.log("\n\n")
  console.log("=====log "+title+" start======") 
  console.log(("log tile :: " + moment(date).format('YYYY MM DD HH:mm:ss')))
  console.log(data)
  console.log("=====log "+title+" end======") 
};

logUtil.logSql = function(title,data){
  if(SQL_LOG_VIEW) {
    console.log("\n\n")
    console.log("=====log "+title+" start======") 
    console.log(data)
    console.log("=====log "+title+" end======") 
  }
};

module.exports = logUtil;
