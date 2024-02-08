let isNullOrEmpty = require('is-null-or-empty');
const path = require('path');
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))

function fnGetPannelCnt(req, param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =
        ` SELECT count(1) cnt
        FROM tb_product_info tp inner join tb_advisor_site ta on tp.ad_seq = ta.seq and  ta.use_yn = 'Y' 
        left join tb_sell_product ts on tp.seq = ts.pi_seq and ts.view_yn ='Y'
        `
        
        if (param.memo == "1") {
            sql += " and ta.a_memo like '%"+param.srchText+"%' "
        }
        sql += " where 1 =1 "
        if (!isNullOrEmpty(param.srtDt)) {
            sql += ` and DATE_FORMAT(tp.crt_dt, '%Y-%m-%d') >= '${param.srtDt}' `
        }
        if (!isNullOrEmpty(param.endDt)) {
            sql += `  and DATE_FORMAT(tp.crt_dt, '%Y-%m-%d') <= '${param.endDt}' `
        }
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }

            resolve(ret[0].cnt);
        });
    });
}

function fnGetPannelList(req, param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =
        ` 
        SELECT tp.seq, tp.ad_seq, tp.service, tp.name, tp.type, tp.rate, tp.min, tp.max, tp.dripfeed, tp.refill, tp.cancel, tp.category, tp.use_yn, DATE_FORMAT(tp.crt_dt,  '%Y-%m-%d %H:%i') crt_dt, 
          ta.a_memo, ifnull(ts.seq,0) sellSeq
        FROM tb_product_info tp inner join tb_advisor_site ta on tp.ad_seq = ta.seq and  ta.use_yn = 'Y'  left join tb_sell_product ts on tp.seq = ts.pi_seq and ts.view_yn ='Y'
        `

        if (param.memo == "1") {
            sql += " and ta.a_memo like '%"+param.srchText+"%' "
        }
        sql += " where 1 =1 "
        if (!isNullOrEmpty(param.srtDt)) {
            sql += ` and DATE_FORMAT(tp.crt_dt, '%Y-%m-%d') >= '${param.srtDt}' `
        }
        if (!isNullOrEmpty(param.endDt)) {
            sql += `  and DATE_FORMAT(tp.crt_dt, '%Y-%m-%d') <= '${param.endDt}' `
        }

        sql += " order by tp.crt_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage
        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }

            resolve(ret);
        });
    });
}

function fnSetSellProduct(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =
        ` INSERT INTO tb_sell_product
        (pi_seq, category_seq, title, view_yn, price, min, max, sell_desc, crt_dt)
        VALUES(${param.piSeq}, '${param.categorySeq}', '${param.pTitle}','${param.viewYN}', ${param.pPrice}, ${param.pMin}, ${param.pMax}, '', CURRENT_TIMESTAMP); `

        logUtil.logMsg("Query - fnSetSellProduct - 판매 상품 등록" , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }

            resolve(ret);
        });
    });
}

function fnGetPannelGroup(conn) {
    return new Promise(function (resolve, reject) {
        let sql =
        ` 
        select seq, title from tb_category where view_yn = 'Y'
        `

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }

            resolve(ret);
        });
    });
}

function fnGetSellProductCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =
        ` 
        SELECT count(1) cnt
        FROM tb_sell_product where view_yn ='Y'
        `

        if (!isNullOrEmpty(param.srtDt)) {
            sql += ` and DATE_FORMAT(crt_dt, '%Y-%m-%d') >= '${param.srtDt}' `
        }
        if (!isNullOrEmpty(param.endDt)) {
            sql += `  and DATE_FORMAT(crt_dt, '%Y-%m-%d') <= '${param.endDt}' `
        }
        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }

            resolve(ret[0].cnt);
        });
    });
}

function fnGetSellProductList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =
        ` 
        SELECT tp.seq, tp.pi_seq, tp.title, tp.view_yn, tp.price,tp.min, tp.max, tp.sell_desc, tp.crt_dt, tc.seq category_seq, tc.title category_title
        FROM tb_sell_product tp left join tb_category tc on tc.seq = tp.category_seq where tp.view_yn ='Y'
        `
        if (!isNullOrEmpty(param.seq)) {
            sql += ` and tp.seq = '${param.seq}' `
        }
        if (!isNullOrEmpty(param.srtDt)) {
            sql += ` and DATE_FORMAT(tp.crt_dt, '%Y-%m-%d') >= '${param.srtDt}' `
        }
        if (!isNullOrEmpty(param.endDt)) {
            sql += `  and DATE_FORMAT(tp.crt_dt, '%Y-%m-%d') <= '${param.endDt}' `
        }

        sql += " order by tp.crt_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage
        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }

            resolve(ret);
        });
    });
}

function fnGetCategoryCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =
        ` 
        SELECT count(1) cnt
        FROM tb_category where view_yn ='Y'
        `

        if (!isNullOrEmpty(param.srtDt)) {
            sql += ` and DATE_FORMAT(crt_dt, '%Y-%m-%d') >= '${param.srtDt}' `
        }
        if (!isNullOrEmpty(param.endDt)) {
            sql += `  and DATE_FORMAT(crt_dt, '%Y-%m-%d') <= '${param.endDt}' `
        }
        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }

            resolve(ret[0].cnt);
        });
    });
}

function fnGetCategoryList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =
        ` 
        SELECT seq, title, memo, view_yn, crt_dt
        FROM tb_category where view_yn ='Y'
        `
        if (!isNullOrEmpty(param.seq)) {
            sql += ` and seq = '${param.seq}' `
        }
        if (!isNullOrEmpty(param.srtDt)) {
            sql += ` and DATE_FORMAT(crt_dt, '%Y-%m-%d') >= '${param.srtDt}' `
        }
        if (!isNullOrEmpty(param.endDt)) {
            sql += `  and DATE_FORMAT(crt_dt, '%Y-%m-%d') <= '${param.endDt}' `
        }

        sql += " order by crt_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage
        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }

            resolve(ret);
        });
    });
}


function fnSetCategory(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =
        `INSERT INTO tb_category
        (title, memo, view_yn, crt_dt)
        VALUES('${param.pTitle}', '',  'Y', CURRENT_TIMESTAMP)  `

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }

            resolve(ret);
        });
    });
}


module.exports.QGetPannelCnt = fnGetPannelCnt;
module.exports.QGetPannelList = fnGetPannelList;


module.exports.QGetSellProductCnt = fnGetSellProductCnt;
module.exports.QGetSellProductList = fnGetSellProductList;

module.exports.QSetSellProduct = fnSetSellProduct;

module.exports.QGetCategoryCnt = fnGetCategoryCnt;
module.exports.QGetCategoryList = fnGetCategoryList;
module.exports.QSetCategory = fnSetCategory;

module.exports.QGetPannelGroup = fnGetPannelGroup;
