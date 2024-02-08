const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./st.sqlmap'); // 여기
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const crypto = require('crypto');
const axios = require('axios');

let isNullOrEmpty = require('is-null-or-empty');

const {v4: uuidv4} = require('uuid');

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

exports.config = async (req, res, next) => {


  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);
  mydb.execute(async conn => {
    var obj = {}
    
    const randomString = generateRandomString(10);
    let basicInfo = {};
      basicInfo.nav1 = "설정"
      basicInfo.nav2 = "공통 설정"
      basicInfo.title = "공통 설정"
      basicInfo.rtnUrl = "setting/config";
      basicInfo.user = req.user;
      let cInfo = await Query.QGetSaveConfig(conn);
      basicInfo.cInfo = cInfo;
      basicInfo.randomString=randomString;
      req.basicInfo = basicInfo;
      next();

  })
}

exports.saveConfig = async (req, res, next) => {
  let {cf_cost1, cf_point1,cf_unit1} = req.body;  
  var obj = {};
  obj.cf_cost1 = cf_cost1;
  obj.cf_point1 = cf_point1;
  obj.cf_unit1 = cf_unit1;
console.log(obj)
  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);
  mydb.execute(async conn => {
    await Query.QSetSaveConfig(obj, conn);
    conn.commit();
      return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ));
  })
}

exports.viewProductCd = async (req, res, next) => {
  let basicInfo = {}

  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);
  mydb.execute(async conn => {
    var obj = {}
    let productCdList = await Query.QProductCdList(obj, conn);
    let basicInfo = {};
      basicInfo.nav1 = "시스템"
      basicInfo.nav2 = "상품코드"
      basicInfo.title = "상품코드"
      basicInfo.rtnUrl = "setting/productcd";
      basicInfo.user = req.user;
  
      basicInfo.productCdList = productCdList;
      
      req.basicInfo = basicInfo;
      next();

  })
}

exports.setProductCode = async (req, res, next) => {
   
  let {productNm, useYn, category,krw,usd,matchId} = req.body;

  var obj = {};
  obj.productNm = productNm;    
  obj.useYn = useYn;   
  obj.category = category;     
  obj.krw = krw;     
  obj.usd = usd;     
  obj.matchId = matchId;     
  obj.memId = req.user.memId 


  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);

  mydb.executeTx(async conn => {
    try {
      await Query.QSetProductCd(obj, conn)
      conn.commit()
      res.json(rtnUtil.successTrue("","" ))
    } catch (e) {
      conn.rollback()
      res.json(rtnUtil.successFalse("", ""));
    }
    
  })
}

exports.VCommCodeMst = async (req, res, next) => {
    let basicInfo = {}
  
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    mydb.execute(async conn => {
      var obj = {}
      let cmmMstList = await Query.QCommCodeMstList(obj, conn);
      let basicInfo = {};
        basicInfo.nav1 = "설정"
        basicInfo.nav2 = "공통코드"
        basicInfo.title = "공통코드"
        basicInfo.rtnUrl = "setting/commcd";
        basicInfo.user = req.user;
    
        basicInfo.cmmMstList = cmmMstList;
        
        req.basicInfo = basicInfo;
        next();

    })
  }
  
  exports.VCommCodeDtl = async (req, res, next) => {
    var cmmCd = req.body.cmmCd;  
    var obj = {};
    obj.cmmCd = cmmCd;
  
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    mydb.execute(async conn => {
      let cmmDtlList = await Query.QCommCodeDtlList(obj, conn);
      res.send({dtlList:cmmDtlList});
    })
  }
  
  exports.setCommCodeMst = async (req, res, next) => {
   
    let {cmmNm, useYn, cmmDesc} = req.body;

    var obj = {};
    obj.cmmNm = cmmNm;    
    obj.useYn = useYn;   
    obj.cmmDesc = cmmDesc;     
    obj.memId = req.user.memId 
  
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
  
    mydb.executeTx(async conn => {
      try {
        await Query.QSetCommCodeMst(obj, conn)
        conn.commit()
        res.json(rtnUtil.successTrue("","" ))
      } catch (e) {
        conn.rollback()
        res.json(rtnUtil.successFalse("", ""));
      }
      
    })
  }
  
  exports.setCommCodeDtl = async (req, res, next) => {
    var cmmCd = req.body.cmmCd; 
    var cmmDtlName = req.body.cmmDtlName;  
    var cmmDtlDesc = req.body.cmmDtlDesc;  
    var cmmDtlDesc1 = req.body.cmmDtlDesc1;  
    var cmmSn = req.body.cmmSn; 
    
    var obj = {};
    obj.cmmCd = cmmCd;    
    obj.cmmDtlName = cmmDtlName;    
    obj.cmmDtlDesc = cmmDtlDesc;   
    obj.cmmSn = cmmSn;   
    obj.accountId = req.user.memId;   
  
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
  
    mydb.execute(async  conn => {
      try {
        await Query.QSetCommCodeDtl(obj, conn)
        conn.commit()
        res.json(rtnUtil.successTrue("","" ))
      } catch (e) {
        conn.rollback()
        res.json(rtnUtil.successFalse("", ""));
      }
      
    })
  }

  exports.pushAPI = async (req, res, next) => {

    let {memId} = req.body;  

   

  
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
  
    mydb.execute(async  conn => {
      try {
        let l = await Query.QGetPointMst(memId, conn);
        console.log(l)
        token = l[0].sn_key;
        
        snKey = "224cb49c-1d55-4338-b28c-5bbe79dca20f"
        millis = "1700805915390"
        let msg = millis+snKey+token;
        console.log(msg)
        let cacl_hash_value = crypto.createHash('sha256').update(msg).digest('hex')
        console.log(cacl_hash_value)
        const postData = {
          millis: '1700805915390',
          token: token,
          hash_value : cacl_hash_value
          // 추가 필요한 데이터는 여기에 추가
        };
        
        axios.post('http://api.ggmpay.com/api/noti_p', postData)
          .then(response => {
            console.log('응답 받음:', response.data);
          })
          .catch(error => {
            console.error('에러 발생:', error);
          });

        res.json(rtnUtil.successTrue("","" ))
      } catch (e) {
        console.log(e)
        res.json(rtnUtil.successFalse("", ""));
      }
      
    })
  }
  