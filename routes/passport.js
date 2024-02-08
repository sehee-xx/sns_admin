const path = require("path")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');

var randomstring = require("randomstring");
const logUtil = require(path.join(process.cwd(),'/routes/services/logUtil'))
const encUtil = require(path.join(process.cwd(),'/routes/services/encUtil'))

const Mydb = require(path.join(process.cwd(),'/routes/config/mydb'))
const axios = require('axios');
var qs = require('qs');

const moment = require("moment");
const date = moment(new Date());

module.exports = (pool) => {
  passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
    console.log("passport.serializeUser call");
    done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
  });

  passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
    //console.log("passport.deserializeUser call");
    done(null, user); // 여기의 user가 req.user가 됨
  });

  passport.use(
      "signin",
      new LocalStrategy(
          {
            usernameField: "memId",
            passwordField: "memPass",
            session: true, // 세션에 저장 여부
            passReqToCallback: true, // 인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
          },
          async function (req, memId, memPass,  done) {
            console.log("passport 진입 ")
            memId = memId.substring(1);
            memPass = memPass.substring(1);
            let data = {
              memId : memId,
            };
            let pool = req.app.get('pool');
            let mydb = new Mydb(pool);
            try {
              mydb.execute( async conn =>  {
                let memInfo = await fnGetAdminInfo(data, conn);
                let isMem = false;
                if(memInfo.length > 0) {
                  let checkPass = await encUtil.decodingPasswordHash(memPass, memInfo[0].lsalt);
                  if(checkPass == memInfo[0].lpassword) {
                    isMem = true;
                  } 
                }
                
              

                if(isMem) {
                  let user = {};
                  if ( memInfo[0].admin_yn == 'Y') {
                    user.memId = memInfo[0].mem_id;
                    user.memNm = memInfo[0].mem_nm;
                    user.mem_hp = memInfo[0].mem_hp;
                    user.mem_email = memInfo[0].mem_email;
                    user.mem_agent = memInfo[0].mem_agent;
                    user.recmmndr_id = memInfo[0].recmmndr_id;
                    user.user_status = memInfo[0].user_status;         
                    user.sessionTime = date.format("YYYYMMDDHHMM");
                    user.logKey = memInfo[0].mem_id+date.format("YYYYMMDDHHMM");
                    return done(null, user);
                  } else {
                    console.log(3);
                    return done(null,null, { message: '관리자가 아닙니다.' });
                  }
                 
                 
                  
                } else {
                  console.log(3);
                  return done(null,null, { message: '존재하지 않은 아이디입니다. ID를 확인해 주세요' });
                }
              })
            } catch (e) {
              logUtil.errObj("signin error", e);
              return done(null, null, { message: "잠시후 다시 시도해주시길 바랍니다." });
            }
          },
      ),
  );


  function fnGetAdminInfo(param, conn) {
    return new Promise(function (resolve, reject) {
      var sql =` SELECT mem_id, mem_nm, lpassword, lsalt, mem_hp, mem_email, mem_agent, recmmndr_id,admin_yn,user_status
      FROM tb_membership tm 
      WHERE mem_id = '${param.memId}' `

      //console.log(sql)
      conn.query(sql, (err, ret) => {
        if (err) {
          console.log(err)
          reject(err)
        }
        resolve(ret);
      });
    });
  }
}

function QGetRcmmndrList(param, conn) {
  return new Promise(function (resolve, reject) {
      var sql = `
      WITH RECURSIVE t3 (seq, mem_id,a_nm ,unit,upper_seq,a_rate) AS

      (

          SELECT t1.seq, t1.mem_id, t1.a_nm ,1 AS unit, t1.upper_seq,t1.a_rate
          FROM tb_agent t1
          WHERE t1.upper_seq  = (select seq from tb_agent where mem_id = '${param.memId}')
          UNION ALL
          SELECT t2.seq, t2.mem_id, t2.a_nm ,t3.unit + 1 as unit  ,t2.upper_seq, t2.a_rate
          FROM tb_agent t2
          INNER JOIN t3 ON t2.upper_seq  = t3.seq 
      )

      SELECT t0.seq as name, t0.mem_id , (select mem_nm from tb_membership tc where tc.mem_id = t0.mem_id) mem_nm,
       t0.a_nm ,0 AS boss, t0.upper_seq  as parent_id,t0.a_rate  FROM tb_agent t0
      WHERE t0.seq = (select seq from tb_agent where mem_id = '${param.memId}')
      UNION ALL
      SELECT seq as name, mem_id, (select mem_nm from tb_membership tc where tc.mem_id = t3.mem_id) mem_nm, a_nm ,unit as boss, upper_seq as parent_id, a_rate
        FROM t3;
      `

      console.log('fnGetRcmmndrList ==>', sql);
      conn.query(sql, (err, ret) => {
          if (err) {
              console.log(err)
              reject(err)
          }


          resolve(ret);
      });
  });
}