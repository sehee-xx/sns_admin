let isNullOrEmpty = require("is-null-or-empty");
const path = require("path");
const logUtil = require(path.join(process.cwd(), "/routes/services/logUtil"));

function fnGetAgentCnt(param, conn) {
  return new Promise(function (resolve, reject) {
    let sql = ` select count(1) as cnt   FROM tb_agent tm where 1=1 
        and tm.mem_id = '${param.memId}' and use_yn = 'Y'`;

    console.log("fnGetAgentCnt :>> ", sql);
    conn.query(sql, (err, ret) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(ret[0].cnt);
    });
  });
}

function fnGetMemInfoById(param, conn) {
  return new Promise(function (resolve, reject) {
    let sql = " SELECT ";
    sql += " tm.mem_id , ";
    sql += " tm.mem_nm , ";
    sql += " tm.lpassword , ";
    sql += " tm.lsalt , ";
    sql += " tm.mem_hp , ";
    sql += " tm.mem_email , ";
    sql += " tm.mem_agent , ";
    sql += " tm.user_status , ";
    sql += " fn_get_name(tm.user_status) user_status_nm , ";
    sql += " tm.admin_yn ,";
    sql += " tm.crt_dt   ";
    sql += " FROM tb_membership tm ";
    sql += " where 1=1 ";

    if (!isNullOrEmpty(param.memId)) {
      sql += " and tm.mem_id = '" + param.memId + "' ";
    }

    // console.log('fnGetMemInfoById :>> ', sql);
    conn.query(sql, (err, ret) => {
      if (err) {
        console.log(err);
        logUtil.logMsg("", "Query-fnGetMemInfoById - 회원조회 ", sql);
        reject(err);
      }
      resolve(ret);
    });
  });
}

function fnSetMemInfo(param, conn) {
  return new Promise(function (resolve, reject) {
    let sql = " INSERT INTO tb_membership ";
    sql +=
      " (mem_id, mem_nm, lpassword, lsalt, mem_hp, mem_email, crt_dt, crt_mem )";
    sql +=
      " VALUES('" +
      param.memId +
      "' , '" +
      param.memNm +
      "' ,'" +
      param.memPw +
      "' ,'" +
      param.memSalt +
      "' ,'" +
      param.memHp +
      "' ";
    sql +=
      " ,'" +
      param.memEmail +
      "' ,  CURRENT_TIMESTAMP , '" +
      param.crtMem +
      "' ) ";

    logUtil.logMsg("", "Query-fnSetMemInfo - 회원가입 ", sql);
    conn.query(sql, (err, ret) => {
      if (err) {
        console.log(err);

        reject(err);
      }
      resolve(ret);
    });
  });
}

function fnGetProductList(param, conn) {
  return new Promise(function (resolve, reject) {
    let sql = ` 
        SELECT  (@rownum:=@rownum+1) as rownum,m_seq, title, main_content , REPLACE(file_main_name, '/upload', 'http://localhost:8612/upload') as file_main_name , use_yn, DATE_FORMAT(crt_dt,  '%Y-%m-%d %H:%i') crt_dt, 
            crt_mn, fn_get_name(p_type) p_type_nm, p_type
            FROM tb_product_mst where (@rownum:=0)=0 and use_yn ='Y' order by crt_dt desc limit 7
        `;
    console.log(sql);
    conn.query(sql, (err, ret) => {
      if (err) {
        console.log(err);

        reject(err);
      }

      resolve(ret);
    });
  });
}

function fnGetProductSel(param, conn) {
  return new Promise(function (resolve, reject) {
    let sql = ` 
        SELECT * FROM (
             SELECT (@rownum:=@rownum+1) as rownum, m_seq, title, main_content ,
             REPLACE(file_main_name, '/upload', 'http://localhost:8612/upload') as file_main_name , 
             REPLACE(content, '../upload', 'http://127.0.0.1:8612/upload') AS content,   file_name, use_yn, DATE_FORMAT(crt_dt,  '%Y-%m-%d %H:%i') crt_dt, 
            crt_mn, fn_get_name(p_type) p_type_nm, p_type
            FROM tb_product_mst where (@rownum:=0)=0 and use_yn ='Y' order by crt_dt desc  ) T
        WHERE T.rownum = ${param.index} `;

    console.log(sql);
    conn.query(sql, (err, ret) => {
      if (err) {
        console.log(err);

        reject(err);
      }

      resolve(ret);
    });
  });
}

function fnGetMemberInfo(param, conn) {
  return new Promise(function (resolve, reject) {
    let sql = ` select mem_id, mem_nm, mem_hp, mem_email   FROM tb_member tm where 1=1 
        and tm.mem_id = '${param.memId}' and use_yn = 'Y'`;

    console.log("fnGetAgentCnt :>> ", sql);
    conn.query(sql, (err, ret) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(ret[0].cnt);
    });
  });
}

function fnUptProductInfo(param, conn) {
  return new Promise(function (resolve, reject) {
    let sql = ` update tb_sales set confirm = '${param.confirm}' , order_msg = '${param.orderMsg}' where order_id = ${param.orderId}`;

    console.log("fnGetAgentCnt :>> ", sql);
    conn.query(sql, (err, ret) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(ret[0].cnt);
    });
  });
}

function fnGetCategoryData(param, conn) {
  //   console.log("param?!", param); undefined
  return new Promise(function (resolve, reject) {
    let sql = "SELECT * FROM tb_category"; // 카테고리 테이블에서 데이터를 가져오는 SQL 쿼리

    console.log("!!!!", sql);
    conn.query(sql, (err, ret) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(ret);
    });
  });
}

function fnGetSellProductData(param, conn) {
  return new Promise(function (resolve, reject) {
    let sql = `select tc.seq as category_seq, tc.title as category_title, tsp.title as product_title, tsp.min, tsp.max, tsp.price
      from tb_sell_product tsp 
      inner join tb_category tc on tsp.category_seq = tc.seq`;
    if (!isNullOrEmpty(param.categorySeq)) {
      sql += ` where tsp.category_seq = ${param.categorySeq}`;
    }
    sql += ` order by tsp.category_seq asc`;

    console.log("!!!!", sql);
    conn.query(sql, (err, ret) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(ret);
    });
  });
}

module.exports.QGetMemInfoById = fnGetMemInfoById;
module.exports.QGetAgentCnt = fnGetAgentCnt;
module.exports.QSetMemInfo = fnSetMemInfo;
module.exports.QGetProductList = fnGetProductList;
module.exports.QGetProductSel = fnGetProductSel;
module.exports.QGetMemberInfo = fnGetMemberInfo;
module.exports.QUptProductInfo = fnUptProductInfo;
module.exports.QGetCategoryList = fnGetCategoryData;
module.exports.QGetSellProductList = fnGetSellProductData;
