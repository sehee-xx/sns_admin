let isNullOrEmpty = require('is-null-or-empty');


function fnGetSaveConfig(conn) {
    return new Promise(function(resolve, reject) {
        var sql = ` 
        SELECT seq, cf_cost1, cf_point1, cf_unit1, crt_dt FROM tb_config_common order by crt_dt desc  limit 1 `

        console.log(sql)
        conn.query(sql, (err, ret) => {        
            if (err) {     
                console.log(err)                        
                reject(err)          
            }            
            resolve(ret);
        });
    }); 
}

function fnSetSaveConfig(param, conn) {
    return new Promise(function(resolve, reject) {
        var sql = ` 
        INSERT INTO tb_config_common
        (cf_cost1, cf_point1, cf_unit1)
        VALUES(${param.cf_cost1}, ${param.cf_point1}, ${param.cf_unit1})
         ON DUPLICATE KEY 
         UPDATE cf_cost1=${param.cf_cost1}, cf_point1=${param.cf_point1} , cf_unit1 = ${param.cf_unit1}  `

        console.log(sql)
        conn.query(sql, (err, ret) => {        
            if (err) {     
                console.log(err)                        
                reject(err)          
            }            
            resolve(ret);
        });
    }); 
}

function fnProductCdList(param, conn) {
    return new Promise(function(resolve, reject) {
        var sql = ` SELECT product_cd, product_nm, use_yn, category,krw, usd, match_id, crt_dt, crt_mem, upt_dt, upt_mem
                    FROM tb_product_cd; `


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

function fnSetProductCd(param, conn) {
    return new Promise(function(resolve, reject) {
        var sql = ` INSERT INTO prime_pg.tb_product_cd
        (product_cd, product_nm, use_yn, category,krw, usd, match_id, crt_dt, crt_mem)
        VALUES(FN_GEN_KEY('tb_product_cd'), '${param.productNm}', 'Y', '${param.category}',${param.krw} ,${param.usd} ,${param.matchId} ,now(),'${param.memId}' ); `


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


/*
* 공통 코드 마스터 리스트
*/
function fnCommCodeMstList(param, conn) {
    return new Promise(function(resolve, reject) {
        var select = "SELECT  CMM_CD as cmmCd,CMM_NAME as cmmName,USE_YN as useYn "
        var column = " ,CMM_DESC as cmmDesc, CREATE_DATE as createDate ,CREATE_USER as createUser "
        var from = " FROM tb_comm_cd_mst"
        var sql = select.concat(column, from);

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

/*
* 공통 코드 서브 리스트 
*/
function fnCommCodeDtlList(param, conn) {
    return new Promise(function(resolve, reject) {
        var select = "SELECT  CMM_DTL_CD as cmmDtlCd, CMM_DTL_NAME as cmmDtlName, CMM_CD as cmmCd, USE_YN as useYn "
        var column = " ,CMM_DTL_DESC as cmmDtlDesc, CMM_SN as cmmSn, CREATE_DATE as createDate ,CREATE_USER as createUser "
        var from = " FROM tb_comm_cd_dtl"
        var where = " WHERE CMM_CD = '"+param.cmmCd+"'";
        var orderby = " order by cmm_sn asc "
        var sql = select.concat(column, from, where, orderby);

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

/*
* 공통 코드 서브 단건 
*/
function fnCommCodeDtlOnce(cmmDtlCd, conn) {
    return new Promise(function(resolve, reject) {
        var select = "SELECT  CMM_DTL_CD as cmmDtlCd, CMM_DTL_NAME as cmmDtlName, CMM_CD as cmmCd, USE_YN as useYn "
        var column = " ,CMM_DTL_DESC as cmmDtlDesc, CMM_SN as cmmSn, CREATE_DATE as createDate ,CREATE_USER as createUser "
        var from = " FROM tb_comm_cd_dtl"
        var where = " WHERE CMM_DTL_CD = '"+cmmDtlCd+"'";
        var orderby = " order by cmm_sn asc "
        var sql = select.concat(column, from, where, orderby);

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

/*
* 공통 코드 마스터 
*/
function fnSetCommCodeMst(param, conn) {
    return new Promise(function(resolve, reject) {
        var insert = "INSERT INTO tb_comm_cd_mst "
        var column = " (CMM_CD,CMM_NAME,USE_YN,CMM_DESC,CREATE_DATE,CREATE_USER)"         
        var values = " VALUES (FN_GEN_KEY('TB_COMM_CD_MST'),'"+param.cmmNm+"','Y','"+param.cmmDesc+"',now(),'"+param.memId+"')"; 
        var sql = insert.concat(column,  values);
        //console.log(sql);
        conn.query(sql, (err, ret) => {        
            if (err) {     
                console.log("fnCommCodeMst call")          
                reject(err)          
            }            
            resolve(ret);
        });
    }); 
}

/*
* 공통 코드 서브 
*/
function fnSetCommCodeDtl(param, conn) {
    return new Promise(function(resolve, reject) {
        var insert = "INSERT INTO tb_comm_cd_dtl "
        var column = " (CMM_DTL_CD,CMM_DTL_NAME,CMM_CD,USE_YN,CMM_DTL_DESC,CMM_SN,CREATE_DATE,CREATE_USER)"         
        var values = " VALUES (FN_GEN_KEY('TB_COMM_CD_DTL'),'"+param.cmmDtlName+"','"+param.cmmCd+"','Y','"+param.cmmDtlDesc+"',cast('"+param.cmmSn+"' as unsigned),now(),'"+param.accountId+"')"; 
        var sql = insert.concat(column,  values);
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


function fnGetPointMst(memId, conn) {
    return new Promise(function(resolve, reject) {
        var sql = ` 
        SELECT seq, mem_id, use_b, use_p, use_r, p_status, crt_dt, sn_key
        FROM tb_use_point_mst where mem_id = '${memId}' `
        
        console.log(sql)
        conn.query(sql, (err, ret) => {        
            if (err) {     
                console.log(err)                        
                reject(err)          
            }            
            resolve(ret);
        });
    }); 
}

module.exports.QCommCodeMstList = fnCommCodeMstList;
module.exports.QCommCodeDtlList = fnCommCodeDtlList;
module.exports.QCommCodeDtlOnce = fnCommCodeDtlOnce;

module.exports.QSetCommCodeMst = fnSetCommCodeMst;
module.exports.QSetCommCodeDtl = fnSetCommCodeDtl;


module.exports.QSetSaveConfig = fnSetSaveConfig;
module.exports.QGetSaveConfig = fnGetSaveConfig;

module.exports.QGetPointMst = fnGetPointMst;

module.exports.QProductCdList = fnProductCdList;
module.exports.QSetProductCd = fnSetProductCd;
