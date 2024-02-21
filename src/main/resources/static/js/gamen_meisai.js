// 普通預金明細前月ボタン
$(document).on('click', '#futsu_backMonth', function() {
  getuChange("fuNengetu", false, "001");
  // 前月非表示チェック
  isHiddenZengetsu("fuNengetu");
  // 翌月ボタン表示
  jigetuDisplay(true);
});

// 普通預金明細翌月ボタン
$(document).on('click', '#futsu_nextMonth', function() {
  getuChange("fuNengetu", true, "001");
  // 翌月ボタン表示判定
  monthCompare("fuNengetu");
  // 前月ボタン表示
  zengetsuDisplay(true);
});

// 貯蓄預金明細前月ボタン
$(document).on('click', '#tyotik_backMonth', function() {
  getuChange("chNengetu", false, "004");
  // 前月非表示チェック
  isHiddenZengetsu("chNengetu");
  // 翌月ボタン表示
  jigetuDisplay(true);
});

// 貯蓄預金明細翌月ボタン
$(document).on('click', '#tyotik_nextMonth', function() {
  getuChange("chNengetu", true, "004");
  // 翌月ボタン表示判定
  monthCompare("chNengetu");
  // 前月ボタン表示
  zengetsuDisplay(true);
});

// 表示月変更 nextMorBackM(true：翌月 false：前月)
function getuChange(elementId, nextMorBackM, typeCd) {
  nidoBoushi(true);
  // 画面項目変更
  var targetM = new Date(document.getElementById(elementId).textContent.replace("年", "/").replace("月", "/1"));
  if (nextMorBackM) {
    // 翌月
    targetM.setMonth(targetM.getMonth() + 1);
  } else {
    // 前月
    targetM.setMonth(targetM.getMonth() - 1);
  }
  document.getElementById(elementId).textContent = formatDateToJapanese(targetM);

  // 月初日
  var from = formatDate(targetM);
  // 月末日
  var to = formatDate(new Date(targetM.getFullYear(), targetM.getMonth() + 1, 0));

  // ユーザ識別子・口座識別子
  var userId = sessionStorage.getItem("user_id");
  var sub_account_id = sessionStorage.getItem("key_sub_account_id");
  var meisai = sessionStorage.getItem(userId + "_" + sub_account_id + "_" + from);
  // 選択口座のその月の明細を取得済か否か(一度表示しているか否か)
  if (meisai != null && meisai != undefined) {
    // 取得済
    if (meisai == 0) {
      // 明細表更新(0件)
      makeNoMeisai(typeCd);
    } else {
      // 明細表の更新
      makeMeisaiTable(typeCd, JSON.parse(meisai).transactions);
    }
    nidoBoushi(false);
  } else {
    // sessionStorafe格納キー(口座明細情報)
    var ssKey = sessionStorage.getItem("user_id") + "_" + sub_account_id;

    // 未取得の場合は口座明細情報取得要求API呼出、明細表の更新
    varUrl = "/sp2/passbook/accounts/" + sub_account_id + "/transactions?from=" + from + "&to=" + to + "&type=" + typeCd;
    doGetAjax(varUrl, sub_account_id, from, typeCd).done(
      function(json_data) {
        // サーバー側エラー
        if (json_data.err_code != null || json_data.err_code != undefined) {
          // セッション切れもしくは不正アクセスの場合ログイン画面に遷移
        	if (json_data.err_code.indexOf("9") == 0) {
              reloadlogin(json_data.message);
          };
  
          // サーバー側エラー発生時、エラーメッセージを画面表示
          outputErrMsg(json_data.message);
        } else {
          // エラーメッセージのクリア
          outputErrMsg("");
          
          // ユーザ識別子_口座識別子_YYYY-MM-01(対象月初日)をキーにする
          ssKey = ssKey + "_" + from;
  
          // meisaiTime_口座識別子をキーに口座明細情報時点時間をsessionStorageに格納
          // 口座明細時点時間は、一度取得したものを表示し続けるため、格納済の場合は設定しない
          if (sessionStorage.getItem("meisaiTime_" + sub_account_id) == undefined
              || sessionStorage.getItem("meisaiTime_" + sub_account_id) == null) {
            sessionStorage.setItem("meisaiTime_" + sub_account_id,
                json_data.transactions_updated_at);
          };
  
          // 口座明細情報をsessionStorageに格納
          if (json_data.transactions == undefined
              || json_data.transactions == null
              || json_data.transactions[0] == undefined
              || json_data.transactions[0] == null) {
            // 口座明細情報0件処理 口座明細情報を0としてsessionStorageに格納
            sessionStorage.setItem(ssKey, 0);
          } else {
            sessionStorage.setItem(ssKey, JSON.stringify(json_data));
          };
  
          // 口座明細情報取得
          if (sessionStorage.getItem(ssKey) != 0) {
            var meisaiData = JSON.parse(sessionStorage.getItem(ssKey));
            // 明細表の更新
            makeMeisaiTable(typeCd, meisaiData.transactions);
          } else {
            // 明細表(0件)の更新
            makeNoMeisai(typeCd);
          };
        }
      }
    );
  }
};

// 表示月と処理月比較
function monthCompare(elementId) {
  var tounengetu = new Date();
  var tounen = tounengetu.getFullYear();
  var tougetu = tounengetu.getMonth() + 1;
  var targetYM = new Date(document.getElementById(elementId).textContent.replace("年", "/").replace("月", "/1"));
  var targetY = targetYM.getFullYear();
  var targetM = targetYM.getMonth() + 1;
  if (tounen == targetY && tougetu == targetM) {
    // 表示月が処理月の場合に翌月ボタン非表示
    jigetuDisplay(false);
  } else {
    jigetuDisplay(true);
  }
};

// 前月の非表示判定
function isHiddenZengetsu(elementId) {
  var date = new Date();
  var latestYear = date.getFullYear() - 10;
  var latestMonth = date.getMonth() + 1;
  var targetYM = new Date(document.getElementById(elementId).textContent.replace("年", "/").replace("月", "/1"));
  var targetY = targetYM.getFullYear();
  var targetM = targetYM.getMonth() + 1;
  if (latestYear == targetY && latestMonth == targetM) {
    // 表示月が処理月の場合は前月ボタン非表示
    zengetsuDisplay(false);
  } else {
    zengetsuDisplay(true);
  }
};

// 翌月ボタン表示・非表示
function jigetuDisplay(hyoji) {
  if (hyoji) {
    document.getElementById("futsu_nextMonth").style.visibility = "visible";
    document.getElementById("tyotik_nextMonth").style.visibility = "visible";
  } else {
    document.getElementById("futsu_nextMonth").style.visibility = "hidden";
    document.getElementById("tyotik_nextMonth").style.visibility = "hidden";
  }
};

// 前月ボタン表示・非表示
function zengetsuDisplay(hyoji) {
  if (hyoji) {
    document.getElementById("futsu_backMonth").style.visibility = "visible";
    document.getElementById("tyotik_backMonth").style.visibility = "visible";
  } else {
    document.getElementById("futsu_backMonth").style.visibility = "hidden";
    document.getElementById("tyotik_backMonth").style.visibility = "hidden";
  }
};
function yearMonthDisplay() {
  // 年月プルダウン
  (function() {
    var optionLoop, this_month, this_year, today;
    today = new Date();
    this_year = today.getFullYear();
    this_month = ("0" +(today.getMonth() + 1)).slice(-2);
    this_ym = this_year + "年" + this_month + "月";
    
    optionLoop = function(start_year, end_year, start_month, end_month, id, day) {
      var first_option_value = (day == 0)? formatDate(new Date(end_year, end_month, day)) : formatDate(new Date(end_year, end_month - 1, day));
      sessionStorage.setItem(id, first_option_value);
      var i, j, ym, ym_value, option, start_j, end_j;
      option = "";
      for (i = start_year; i <= end_year ; i++) {
        start_j = (i == start_year)?start_month:1;
        end_j = (i <= end_year-1)?12:end_month;
        for (j = start_j; j <= end_j ; j++) {
          // value用の年月日を作成する
          ym_value = (day == 0)? formatDate(new Date(i, j, day)) : formatDate(new Date(i, j - 1, day));
          ym = i + "年" + (100 + j).toString().substr(-2) + "月";
          if (ym === this_ym) {
            opt = '<option value="' + ym_value + '" selected>' + ym + '</option>';
          } else {
            opt = '<option value="' + ym_value + '">' + ym + '</option>';
          }
          option += opt;
        }
      }
      document.getElementById(id).innerHTML = option;
    };
    optionLoop(this_year - 10, this_year, this_month, this_month, 'from_year_month', 1);
    optionLoop(this_year - 10, this_year, this_month, this_month, 'to_year_month', 0);
  })();
};

// 明細ダウンロード画面 情報取得
$(document).on('click','#btnMeisaiDL',function() {
  nidoBoushi(true);
  // 推奨ブラウザに関する文言を表示
  showRecommendBrowser();
  // sessionStorageより口座情報取得
  var sub_accounts = JSON.parse(sessionStorage.getItem("key_sub_accounts")).sub_accounts;
  // 選択された口座識別子取得
  var sub_account_id = document.getElementById("target").value;
  $.each(sub_accounts, function(i, value) {
    var number = "";
    if(value.number != null){
      number = value.number;
      // 選択された口座識別子に紐づく情報を各画面項目に設定
      if (sub_account_id == value.sub_account_id) {
        $('.err_msg').empty();
        $('#subaccount_type_m').empty();
        if (getTypeVal(value.type) + "預金" != null) {
          $('#subaccount_type_m').append(getTypeVal(value.type) + "預金");  
        }
        $('#subaccount_branch_number_m').empty();
        if (value.branch_number != null) {
          $('#subaccount_branch_number_m').append(value.branch_number);
        }
        $('#subaccount_number_m').empty();
        if (number != null) {
          $('#subaccount_number_m').append(number);
        }
        // 定期の場合年月プルダウンを非表示にする
        if (getTypeVal(value.type) + "預金" == "普通預金") {
          document.getElementById("pulldown").style.display = "block";
        } else if (getTypeVal(value.type) + "預金" == "貯蓄預金") {
          document.getElementById("pulldown").style.display = "block";
        } else {
          document.getElementById("pulldown").style.display = "none";
        }
      };
    };  
  });
  // 年月のプルダウンの作成
  yearMonthDisplay();
  show("page_meisai_download");
  nidoBoushi(false);
});

