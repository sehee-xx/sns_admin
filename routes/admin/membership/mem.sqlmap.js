let isNullOrEmpty = require('is-null-or-empty');
const path = require('path');
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
/*
* 회원아이디로 조회 
*/

function fnGetMemCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` select count(1) as cnt   FROM tb_membership tm  where 1=1 `

        if (param.srchOption == "1") {
            sql += " and tm.mem_id like '%"+param.srchText+"%' "
        }

        
        if (!isNullOrEmpty(param.srtDt)) {
            sql += ` and DATE_FORMAT(tm.crt_dt, '%Y-%m-%d') >= '${param.srtDt}' `
        }
        if (!isNullOrEmpty(param.endDt)) {
            sql += `  and DATE_FORMAT(tm.crt_dt, '%Y-%m-%d') <= '${param.endDt}' `
        }

        console.log('fnGetGroupCnt :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetMemList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` SELECT 
             tm.mem_id , 
             tm.mem_nm , 
             tm.mem_hp , 
             tm.mem_email , 
             fn_get_name(user_status) user_status_nm, 
             tm.user_status ,
             tm.point , 
             tm.admin_yn ,
             DATE_FORMAT(tm.crt_dt, '%Y-%m-%d') crt_dt 
             FROM tb_membership tm 
             where 1=1 `
        
            if (param.srchOption == "1") {
                sql += " and tm.mem_id like '%"+param.srchText+"%' "
            }
            
            if (!isNullOrEmpty(param.srtDt)) {
                sql += ` and DATE_FORMAT(tm.crt_dt, '%Y-%m-%d') >= '${param.srtDt}' `
            }
            if (!isNullOrEmpty(param.endDt)) {
                sql += `  and DATE_FORMAT(tm.crt_dt, '%Y-%m-%d') <= '${param.endDt}' `
            }
   

            sql += " order by tm.crt_dt desc "
            sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage

        console.log('fnGetMemInfoById :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetAgentCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` select count(1) as cnt from tb_agent tg where 1=1 and FIND_IN_SET(a_id, fn_get_mem_list('${param.memId}')) > 0 `
           
        if (param.srchOption == "1") {
            sql += " and tg.mem_id like '%"+param.srchText+"%' "
        }else if (param.srchOption == "2") { //그룹명
            sql += " and tg.seq like '%"+param.srchText+"%'  "
        }
   
        //console.log('fnGetGroupCnt :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetAgentList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` SELECT seq, a_nm, upper_seq, a_rate, mem_id, use_yn
        FROM tb_agent
            where 1=1 and FIND_IN_SET(a_id, fn_get_mem_list('${param.memId}')) > 0  `
            if (param.srchOption == "1") {
                sql += " and mem_id like '%"+param.srchText+"%' "
            }else if (param.srchOption == "2") { //그룹명
                sql += " and seq like '%"+param.srchText+"%'  "
            }
            sql += " order by crt_dt desc "
            sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage
   
        //console.log('fnGetGroupList :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnGetMemInfoById(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = " SELECT "
            sql +=      " tm.mem_id , "
            sql +=      " tm.mem_nm , "
            sql +=      " tm.lpassword , "
            sql +=      " tm.lsalt , "
            sql +=      " tm.mem_hp , "
            sql +=      " tm.mem_email , "
            sql +=      " tm.mem_agent , "
            sql +=      " tm.admin_yn ,"
            sql +=      " tm.crt_dt   " 
            sql += " FROM tb_membership tm "
            sql += " where 1=1 and FIND_IN_SET(tm.mem_id, fn_get_mem_list('${param.memId}')) > 0  "
            
            if (!isNullOrEmpty(param.memId)) {
                sql += " and tm.mem_id = '"+param.memId+"' "
            }
           
        // console.log('fnGetMemInfoById :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                logUtil.logMsg("", "Query-fnGetMemInfoById - 회원조회 " , sql)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnSetMemInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =" INSERT INTO tb_membership "
        sql += " (mem_id, lpassword, lsalt, mem_agent, crt_dt, crt_mem )"
        sql += " VALUES('"+param.memId+"' , '"+param.memPw+"' ,'"+param.memSalt+"' , '"+param.memAgent+"', CURRENT_TIMESTAMP , '"+param.crtMem+"' ) "

        logUtil.logMsg("", "Query-fnSetMemInfo - 회원가입 " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnGetUsePointMst(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =` 
        SELECT seq, mem_id, use_p, use_r, p_status, crt_dt, use_b
        FROM tb_use_point_mst
            where 1=1 and FIND_IN_SET(mem_id, fn_get_mem_list('${param.memId}')) > 0 
            ` 
            if (!isNullOrEmpty(param.memId)) {
                sql += " and mem_id = '"+param.memId+"' "
            }
           
        logUtil.logMsg("", "Query-fnGetUsePointMst - 회원 포인트 조회 " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                logUtil.logMsg("", "Query-fnGetUsePointMst - 회원머니수정조회 " , sql)
                reject(err)
            }
            resolve(ret);
        });
    });
}


function fnInsUsePointMst(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =` 
        INSERT INTO hts_trading.tb_use_point_mst
        (mem_id, use_p, use_r, p_status, crt_dt, use_b)
        VALUES('${param.memId}', ${param.usePoint}, 0, '', CURRENT_TIMESTAMP, 0)
        `
           
        logUtil.logMsg("", "Query-fnInsUsePointMst - 회원 포인트 등록 " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnUptUsePointMst(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =` 
        UPDATE tb_use_point_mst
        SET use_p= ${param.usePoint}
        WHERE mem_id='${param.memId}';
        `
           
        logUtil.logMsg("", "Query-fnUptUsePointMst - 회원 포인트 수정 " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnInsUsePointDtl(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =` 
        INSERT INTO tb_use_point_dtl
        ( mem_id, b_type, b_increase, b_point, b_desc, crt_dt, crt_mem)
        VALUES( '${param.memId}', '${param.bType}', '${param.bIncrease}', ${param.usePoint}, '${param.memo}', CURRENT_TIMESTAMP, '${param.crtMem}');
        `
           
        logUtil.logMsg("", "Query-fnInsUsePointDtl - 회원 포인트 상세 등록  " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnUptAdminMemInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` UPDATE tb_membership set admin_yn = '${param.adminYN}' where mem_id = '${param.memId}'  `
       
        //console.log('fnUptAdminMemInfo :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnGetAgentProductMatchList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = `
        select tapm.seq, tapm.agent_id, pdi.title , tpc.category , tpc.product_cd ,tpc.product_nm, tpc.krw, tpc.usd
        from tb_agent_product_match tapm 
        inner join tb_product_info pdi on tapm.product_seq = pdi.seq and pdi.use_yn ='Y'
        inner join tb_product_cd tpc on tpc.product_cd  = pdi.product_cd and tpc.use_yn = 'Y'
        where FIND_IN_SET(tapm.agent_id , fn_get_mem_list('${param.memId}')) > 0  and tapm.product_yn = 'Y' and tapm.use_yn = 'Y'; 
        
        `
          
        console.log('fnGetAgentList :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnSetMemberAgentProduct(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = `
        INSERT INTO tb_member_product_match
        (mem_id, ap_seq, use_yn, crt_dt, crt_nm)
        VALUES('${param.pMemId}', ${param.apSeq}, 'Y', CURRENT_TIMESTAMP, '${param.memId}'); `

      
        console.log('fnSetAgentProduct :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}


function fnGetMemberAgentProductList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = `
        select tm.seq, tapm.agent_id, pdi.title , tpc.category , tpc.product_cd ,tpc.product_nm, tpc.krw, tpc.usd , tm.product_yn
        from tb_member_product_match tm 
        inner join tb_agent_product_match tapm on tm.ap_seq = tapm.seq and tapm.use_yn ='Y' and tapm.product_yn = 'Y'
        inner join tb_product_info pdi on tapm.product_seq = pdi.seq and pdi.use_yn ='Y'
        inner join tb_product_cd tpc on tpc.product_cd  = pdi.product_cd and tpc.use_yn = 'Y'
        where tm.mem_id = '${param.pMemId}' and tm.use_yn = 'Y' ; `

      
        console.log('fnGetMemberAgentProductList :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnUptMemYN(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =` 
        UPDATE tb_membership
        SET mem_yn= ${param.stopYn}
        WHERE mem_id='${param.memId}';
        `
           
        logUtil.logMsg("", "Query-fnUptMemYN - 회원 포인트 수정 " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnProductMemYn(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =` 
        UPDATE tb_member_product_match
        SET product_yn= ${param.pViewYn}
        WHERE seq='${param.pSeq}';
        `
           
        logUtil.logMsg("", "Query-fnUptMemYN - 상품 전시 여부 " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnUptMemPassword(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =` UPDATE  tb_membership set lpassword = '${param.memPw}', lsalt = '${param.memSalt}' where mem_id = '${param.memId}'  `
  
        console.log("", "Query-fnUptMemInfo - 회원가입 " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }
            resolve(ret);
        });
    });
  }

module.exports.QGetMemCnt = fnGetMemCnt;
module.exports.QGetMemList = fnGetMemList;

module.exports.QGetAgentCnt = fnGetAgentCnt;
module.exports.QGetAgentList = fnGetAgentList;

module.exports.QGetMemInfoById = fnGetMemInfoById;
module.exports.QSetMemInfo = fnSetMemInfo;
module.exports.QGetUsePointMst = fnGetUsePointMst;
module.exports.QInsUsePointMst = fnInsUsePointMst;
module.exports.QUptUsePointMst = fnUptUsePointMst;
module.exports.QInsUsePointDtl = fnInsUsePointDtl;
module.exports.QUptAdminMemInfo = fnUptAdminMemInfo;

module.exports.QGetAgentProductMatchList = fnGetAgentProductMatchList;
module.exports.QSetMemberAgentProduct = fnSetMemberAgentProduct;
module.exports.QGetMemberAgentProductList = fnGetMemberAgentProductList;

module.exports.QUptMemYN = fnUptMemYN;
module.exports.QProductMemYn = fnProductMemYn;
module.exports.QUptMemPassword = fnUptMemPassword;

