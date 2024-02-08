const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./tree.sqlmap'); // 여기
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const encryption = require(path.join(process.cwd(), '/routes/services/encUtil'));
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const {v4: uuidv4} = require('uuid');
const  HashMap  = require ( 'hashmap' ) ;
var emojiFlags = require('emoji-flags');

exports.view = async (req, res, next) => {
  let { memId } = req.body;
  console.log(req.param)

  if (!memId) {
    console.log("================")
    try {
      let { memId } = req.param('memId');
      if (!memId) memId = "kys001";
    } catch (error) {
      memId = "kys001";
    }

  }

  try {
    let basicInfo = {}
    basicInfo.nav1 = "조직도"
    basicInfo.nav2 = "조직도"
    basicInfo.title = "조직도"

    let alertMessage = {}
    alertMessage.message = ""
    console.log(memId)
    res.render("tree/wrap",{treeName:"추천조직도", memId:memId, link:"/t/binary", basicInfo : basicInfo, alertMessage:alertMessage})
  } catch (e) {
      logUtil.errObj("view error", e);
      next(e);
  }
}

// https://stackblitz.com/edit/js-rvwpza?file=index.html
exports.binary = async (req, res, next) => {
  let pool = req.app.get("pool");
  let mydb = new Mydb(pool);
  let {memId} = req.query;

  let obj = {};
  obj.memId = memId;
  try {
      mydb.executeTx(async (conn) => {
        let treeList = [];

        var map  = new HashMap ( ) ;
        let rcmmList = await Query.QGetRcmmndrList(obj, conn);
        //console.log(rcmmList)
        let series = [];
        rcmmList.forEach((node, idx) => {
          let _mapData = map.get(node.parent_id);
          //console.log(node.name, node.parent_id, _mapData)
          if (_mapData) {
            //console.log("if",node.name, node.parent_id,idx,_mapData)
            map.set(node.name, idx);

            series.push({
                paid_grade: node.a_id,
              department_location_country_region_name: "Americas",
              department_location_id: "1700",
              department_location_postal_code: "98199",
              department_location_street_address: "2004 Charade Rd",
              department_name: "Executive",
              email: "SKING",
              hire_date: "2003-07-16T19:00:00.000Z",
              id: idx,
              image: emojiFlags.countryCode('KR').emoji,
              job_id: "AD_PRES",
              job_max_salary: "40000",
              job_min_salary: "20080",
              lastName: "King",
              location_state: "Washington",
              name: node.a_nm,
              parentId: _mapData,
              phone_number: "515.123.4567",
              position: "Chief Operating Officer",
              salary:node.a_rate,
            })

          } else {
            //console.log("else",node.name, node.parent_id,idx, _mapData)
            map.set(node.name, idx);
            if (idx == 0) {
              // treeList.push({key:0, boss:0, name:node.name, nation:node.nation, headOf:node.headOf});
              // let sub_series = [node.parent_id,node.name];
             
              series.push({
                paid_grade: node.a_id,
                department_location_country_region_name: "Americas",
                department_location_id: "1700",
                department_location_postal_code: "98199",
                department_location_street_address: "2004 Charade Rd",
                department_name: "Executive",
                email: "SKING",
                hire_date: "2003-07-16T19:00:00.000Z",
                id: "0",
                image:  emojiFlags.countryCode('KR').emoji,
                job_id: "AD_PRES",
                job_max_salary: "40000",
                job_min_salary: "20080",
                lastName: "King",
                location_state: "Washington",
                name: node.a_nm,
                parentId: "",
                phone_number: "515.123.4567",
                position: "Chief Operating Officer",
                salary:node.a_rate,
              })
            } else {
              // treeList.push({key:idx, boss:(idx-1), name:node.name, nation:node.nation, headOf:node.headOf});
              // let sub_series = [node.parent_id,node.name];
              let paid_grade = node.paid_grade;
            if (node.paid_grade == undefined) paid_grade = "NONE";
              series.push({
                paid_grade: node.a_id,
                department_location_country_region_name: "Americas",
                department_location_id: "1700",
                department_location_postal_code: "98199",
                department_location_street_address: "2004 Charade Rd",
                department_name: "Executive",
                email: "SKING",
                hire_date: "2003-07-16T19:00:00.000Z",
                id: idx,
                image:  emojiFlags.countryCode('KR').emoji,
                job_id: "AD_PRES",
                job_max_salary: "40000",
                job_min_salary: "20080",
                lastName: "King",
                location_state: "Washington",
                name: node.a_nm,
                parentId: (_mapData),
                phone_number: "515.123.4567",
                position: "Chief Operating Officer",
                salary:node.a_rate,
              })
            }
          }
        })

        //console.log(treeList)
        //console.log(series)
        res.render("tree/rcmmndr",{memId:memId, series:series})
      });
  } catch (e) {
      logUtil.errObj("view error", e);
      next(e);
  }

}