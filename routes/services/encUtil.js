const crypto = require('crypto');
var md5 = require('md5');
var sha256 = require('sha256');


function fnCreatePasswordHash(password) { 
  return new Promise(function (resolve, reject) {
    const salt = crypto.randomBytes(64).toString('base64').replace(/[^A-Za-z0-9]/g, '') 
    crypto.pbkdf2(password, salt, 108236, 64, 'sha512', (err, key) => {  //103312
      console.log("=========CreatePasswordHash=======")
      if (err) reject(err) 
      resolve({password: key.toString('base64'), salt}) 
    }) 
  });
}

function fnDecodingPasswordHash(pwd, salt){
  return new Promise(function (resolve, reject) {

    crypto.pbkdf2(pwd, salt.toString('base64'), 108236, 64, 'sha512', (err, key) => {
      resolve(key.toString('base64'));
    });
  });
}

// 자동 로그인 키 생성
function fnGenerateAutoLoginKey(length){
  return new Promise(function (resolve, reject) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    resolve(randomString)
  });
}


// 자동 로그인 키 생성
function fnMd5Create(pwd){
  return new Promise(function (resolve, reject) {
   
    resolve(md5(pwd))
  });
}


module.exports.createPasswordHash = fnCreatePasswordHash;
module.exports.decodingPasswordHash = fnDecodingPasswordHash;
module.exports.generateAutoLoginKey = fnGenerateAutoLoginKey;
module.exports.md5Create = fnMd5Create;