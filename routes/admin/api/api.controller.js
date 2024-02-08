const path = require("path");
const Mydb = require(path.join(process.cwd(), "/routes/config/mydb"));
const Query = require("./api.sqlmap");
const cmmQuery = require(
  path.join(process.cwd(), "/routes/admin/setting/st.sqlmap")
);

const rtnUtil = require(path.join(process.cwd(), "/routes/services/rtnUtil"));
const logUtil = require(path.join(process.cwd(), "/routes/services/logUtil"));
const encUtil = require(path.join(process.cwd(), "/routes/services/encUtil"));
var passport = require("passport");
const jwt = require("jsonwebtoken");

let isNullOrEmpty = require("is-null-or-empty");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

/*
 * properties
 */
const PropertiesReader = require("properties-reader");
const properties = PropertiesReader("adm.properties");

exports.signupProc = async (req, res, next) => {
  const { memId, memNm, memPass, memHp, memEmail, memAgent } = req.body;
  console.log("signupProc");
  let obj = {
    memId: memId,
    memNm: memNm,
    memHp: memHp,
    memEmail: memEmail,
    memAgent: memAgent,
  };

  let pool = req.app.get("pool");
  let mydb = new Mydb(pool);

  try {
    mydb.executeTx(async (conn) => {
      let memInfo = await Query.QGetMemInfoById(obj, conn);
      try {
        if (memInfo.length > 0) {
          return res.json(
            rtnUtil.successFalse("-1", "사용중인 아이디 입니다.")
          );
        } else {
          // 초기화 비밀번호
          obj.crtMem = memId; // req.user.memId
          let passInfo = await encUtil.createPasswordHash(memPass);
          obj.memPw = passInfo.password;
          obj.memSalt = passInfo.salt;
          let ins = await Query.QSetMemInfo(obj, conn);
          // 은행정보 입력

          conn.commit();

          return res.json(
            rtnUtil.successTrue("200", "정상처리 되었습니다.", obj)
          );
        }
      } catch (e) {
        conn.rollback();
        logUtil.errObj("signUpProc error", e);
        return res.json(
          rtnUtil.successFalse(
            "500",
            "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.",
            ""
          )
        );
      }
    });
  } catch (e) {
    logUtil.errObj("signupProc error", e);
    res.json(
      rtnUtil.successFalse(
        "500",
        "",
        "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요!"
      )
    );
  }
};

exports.agentChk = async (req, res, next) => {
  let pool = req.app.get("pool");
  let mydb = new Mydb(pool);
  let { memId } = req.body;
  console.log(req.body);
  let obj = {};
  obj.memId = memId;

  try {
    mydb.execute(async (conn) => {
      try {
        let memCnt = await Query.QGetAgentCnt(obj, conn);
        if (memCnt > 0) {
          return res.json(rtnUtil.successTrue("200", "확인 되었습니다.", ""));
        } else {
          return res.json(
            rtnUtil.successFalse("500", "추천인 아이디를 확인해 주세요.", "")
          );
        }
      } catch (e) {
        logUtil.errObj("fundMst error", e);
        return res.json(
          rtnUtil.successFalse("500", "추천인 아이디를 확인해 주세요.", "")
        );
      }
    });
  } catch (e) {
    logUtil.errObj("mview error", e);
    next(e);
  }
};

exports.signin = async (req, res, next) => {
  let { memId, memPass } = req.body;
  passport.authenticate("signin", (authError, user, info) => {
    if (authError) {
      // 에러면 에러 핸들러로 보냅니다
      console.log(authError);
      return res.json(rtnUtil.successFalse("500", authError, ""));
    }

    return req.login(user, async (loginError) => {
      if (loginError) {
        return res.json(rtnUtil.successFalse("500", info.message, ""));
      } else {
        const accessTokenSecret = uuidv4();
        const refreshTokenSecret = uuidv4();

        // jwt 발생
        // Access Token 생성 및 전송
        const accessToken = jwt.sign(user, accessTokenSecret, {
          expiresIn: "15m",
        });
        res.cookie("accessToken", accessToken, { httpOnly: true });

        const refreshToken = jwt.sign(user, refreshTokenSecret);
        res.cookie("refreshToken", refreshToken, { httpOnly: true });

        res.json({ accessToken, refreshToken });
      }
    });
  })(req, res, next);
};

exports.productList = async (req, res, next) => {
  let pool = req.app.get("pool");
  let mydb = new Mydb(pool);

  try {
    let index = req.params.index;
    let obj = {};
    obj.index = index;

    console.log(obj);
    mydb.executeTx(async (conn) => {
      try {
        let pList = await Query.QGetProductList(obj, conn);
        if (pList.length > 0) {
          return res.json(
            rtnUtil.successTrue("200", "확인 되었습니다.", pList)
          );
        } else {
          return res.json(
            rtnUtil.successFalse("500", "상품 정보가 존재하지 않습니다.", "")
          );
        }
      } catch (e) {
        logUtil.errObj("fundMst error", e);
        return res.json(
          rtnUtil.successFalse("500", "상품 정보가 존재하지 않습니다.", "")
        );
      }
    });
  } catch (e) {
    logUtil.errObj("mview error", e);
    next(e);
  }
};

exports.productSel = async (req, res, next) => {
  let pool = req.app.get("pool");
  let mydb = new Mydb(pool);

  try {
    let index = req.params.index;
    let obj = {};
    obj.index = index;

    console.log(obj);
    mydb.executeTx(async (conn) => {
      try {
        let pList = await Query.QGetProductSel(obj, conn);
        if (pList.length > 0) {
          return res.json(
            rtnUtil.successTrue("200", "확인 되었습니다.", pList)
          );
        } else {
          return res.json(
            rtnUtil.successFalse("500", "상품 정보가 존재하지 않습니다.", "")
          );
        }
      } catch (e) {
        logUtil.errObj("fundMst error", e);
        return res.json(
          rtnUtil.successFalse("500", "상품 정보가 존재하지 않습니다.", "")
        );
      }
    });
  } catch (e) {
    logUtil.errObj("mview error", e);
    next(e);
  }
};

const generateToken = async (params, conn) => {
  let accessToken = "";
  let refreshToken = "";
  const refreshTokenExpiredDate = new Date(Date.now() + 3600 * 1000 * 24 * 180);
  try {
    const { memId } = params;
    // email에 해당하는 유저의 idx,nickname 추출
    mydb.executeTx(async (conn) => {
      const response = await Query.QGetMemberInfo(memId, conn);

      const { mem_id, nickname } = response[0];
      // Access Token 생성
      const accessTokenPayload = { email, idx, nickname };
      accessToken = JWT.sign(accessTokenPayload, JWT_SECRET);
      // Refresh Token 생성
      const refreshTokenPayload = { accessToken, refreshTokenExpiredDate };
      refreshToken = JWT.sign(refreshTokenPayload, JWT_SECRET);

      // 한번도 토큰을 발급하지 않았을 경우 INSERT, 그 외 UPDATE
      const getResponse = await connection.run(
        `SELECT COUNT(*) as count from user_token WHERE email=?`,
        [email]
      );
      const { count } = getResponse[0];
      if (count > 0) {
        await connection.run(
          `UPDATE user_token SET access_token=?,refresh_token=?,refresh_token_expires_in=? WHERE email=?`,
          [accessToken, refreshToken, refreshTokenExpiredDate, email]
        );
      } else {
        await connection.run(
          `INSERT INTO user_token(email,access_token,refresh_token,refresh_token_expires_in) VALUES(?,?,?,?)`,
          [email, accessToken, refreshToken, refreshTokenExpiredDate]
        );
      }
    });
  } catch (error) {
    paramsErrorHandler(e);
  }
  return {
    status: 201,
    //cookie에 Refresh Token 저장
    cookie: {
      name: "refreshToken",
      val: refreshToken,
      options: {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      },
    },
    data: {
      success: true,
      accessToken,
    },
  };
};

exports.callbackCheck = async (req, res, next) => {
  const { order_id, status } = req.body;
  let pool = req.app.get("pool");
  let mydb = new Mydb(pool);
  console.log(req.body);
  let obj = {};
  obj.orderId = order_id;
  if (status == "REFUSED") obj.confirm = "CMCD00000000000024";
  else obj.confirm = "CMCD00000000000023";
  obj.orderMsg = status;
  mydb.executeTx(async (conn) => {
    try {
      await Query.QUptProductInfo(obj, conn);
      conn.commit();
      return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ""));
    } catch (e) {
      return res.json(
        rtnUtil.successFalse(
          "500",
          "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.",
          ""
        )
      );
    }
  });

  return res.json(rtnUtil.successTrue("200", "확인 되었습니다.", ""));
};

// 카테고리 테이블 데이터를 가져오는 API 엔드포인트
exports.category = async (req, res, next) => {
  //   console.log("REQ", req);
  try {
    // 데이터베이스 연결 풀 가져오기
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);

    // 요청에서 인덱스 매개변수 가져오기
    let index = req.params.index;
    // console.log("인덱스 뭘까", index);

    // 카테고리 테이블 데이터를 가져오는 쿼리 실행
    mydb.executeTx(async (conn) => {
      try {
        // 카테고리 테이블에서 데이터를 가져오는 쿼리 실행
        let categoryList = await Query.QGetCategoryList(index, conn);

        // 가져온 데이터가 있으면 응답으로 반환
        if (categoryList.length > 0) {
          return res.json(
            rtnUtil.successTrue(
              "200",
              "카테고리 정보를 성공적으로 받아왔습니다.",
              categoryList
            )
          );
        } else {
          // 가져온 데이터가 없으면 실패 응답 반환
          return res.json(
            rtnUtil.successFalse(
              "500",
              "카테고리 정보가 존재하지 않습니다.",
              ""
            )
          );
        }
      } catch (e) {
        // 오류 발생 시 실패 응답 반환
        logUtil.errObj("카테고리 데이터를 가져오는 중 오류 발생", e);
        return res.json(
          rtnUtil.successFalse(
            "500",
            "카테고리 정보를 받아오는 중에 오류가 발생했습니다.",
            ""
          )
        );
      }
    });
  } catch (e) {
    // 오류 발생 시 다음 미들웨어로 전달
    logUtil.errObj("카테고리 함수에서 오류 발생", e);
    next(e);
  }
};

// 판매 상품 테이블 데이터를 가져오는 API 엔드포인트
exports.sellproduct = async (req, res, next) => {
  //   console.log("REQ", req);
  try {
    // 데이터베이스 연결 풀 가져오기
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);

    // 요청에서 인덱스 매개변수 가져오기
    let index = req.params.index;
    // console.log("인덱스 뭘까", index);

    // 판매 상품 데이터를 가져오는 쿼리 실행
    mydb.executeTx(async (conn) => {
      try {
        // 판매 상품 테이블에서 데이터를 가져오는 쿼리 실행
        let categoryList = await Query.QGetSellProductList(index, conn);

        // 가져온 데이터가 있으면 응답으로 반환
        if (categoryList.length > 0) {
          return res.json(
            rtnUtil.successTrue(
              "200",
              "판매 상품 정보를 성공적으로 받아왔습니다.",
              categoryList
            )
          );
        } else {
          // 가져온 데이터가 없으면 실패 응답 반환
          return res.json(
            rtnUtil.successFalse(
              "500",
              "판매 상품 정보가 존재하지 않습니다.",
              ""
            )
          );
        }
      } catch (e) {
        // 오류 발생 시 실패 응답 반환
        logUtil.errObj("판매 상품 데이터를 가져오는 중 오류 발생", e);
        return res.json(
          rtnUtil.successFalse(
            "500",
            "판매 상품 정보를 받아오는 중에 오류가 발생했습니다.",
            ""
          )
        );
      }
    });
  } catch (e) {
    // 오류 발생 시 다음 미들웨어로 전달
    logUtil.errObj("판매 상품 함수에서 오류 발생", e);
    next(e);
  }
};
