// 口座選択リストボックス変更
function fucSubaccChange() {
  // sessionStorageより口座情報取得
  var sub_accounts = JSON.parse(sessionStorage.getItem("key_sub_accounts")).sub_accounts;
  // 選択された口座識別子取得
  var sub_account_id = document.getElementById("target").value;
  $.each(sub_accounts, function(i, value) {
    var number = "";
    if(value.number != null){
      number = value.number;
    };
    // 選択された口座識別子に紐づく情報を各画面項目に設定
    if (sub_account_id == value.sub_account_id) {
      clearSelectAccountData();
      $('.err_msg').empty();
      $('#subaccount_type').append(getTypeVal(value.type) + "預金");
      $('#subaccount_user_name').append(value.user_name);
      $('#subaccount_branch_number').append(value.branch_number);
      $('#subaccount_branch').append(value.branch);
      $('#subaccount_number').append(number);
      return false;
    };
  });
};

// 明細表示ボタン押下
$(document).on('click','#btnMeisai',function() {
  nidoBoushi(true);
  // 口座識別子をsessionStorageに格納
  var sub_account_id = $("#target").val();
  sessionStorage.setItem("key_sub_account_id", sub_account_id);

  // 口座残高取得要求API,口座明細情報取得要求API呼出、口座明細表示画面へ切替
  var varUrl = "/sp2/passbook/accounts/";
  var typeCd = getTypeCd($("#subaccount_type").html().replace("預金", ""));
  var sendUrl = varUrl + sub_account_id + "?type=" + typeCd;
  // 処理日時の月初日
  var from = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  // 処理日時の月末日
  var to = formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

  // 口座残高取得要求API
  doGetAjax(sendUrl, null, null, null).done(
    function(json_data) {
      // 通信成功処理
      // サーバー側エラー
      if (json_data.err_code != null || json_data.err_code != undefined) {
        
        // セッション切れもしくは不正アクセスの場合ログイン画面に遷移
        if (json_data.err_code.indexOf("9") == 0) {
          reloadlogin(json_data.message);
        };

        // サーバー側エラー発生時、エラーメッセージを画面表示
        outputErrMsg(json_data.message);

      } else {
        // 口座残高情報をsessionStorageにJSON文字列に変換して格納
        sessionStorage.setItem("subac_info", JSON.stringify(json_data));

        // 口座明細情報取得要求API呼出、画面遷移
        callKouzaMeisai(typeCd, varUrl, sub_account_id, from, to);
      }
    }
  )
});

// 口座明細情報取得要求API呼出、画面遷移
function callKouzaMeisai(typeCd, varUrl, sub_account_id, from, to) {

  // sessionStorafe格納キー(口座明細情報)
  var ssKey = sessionStorage.getItem("user_id") + "_" + sub_account_id;

  if (typeCd == TYPE_CODE.TEIKI) {
    // 定期の場合
    varUrl = varUrl + sub_account_id + "/transactions?type=" + typeCd;
    doGetAjax(varUrl, sub_account_id, null, typeCd).done(
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

          // 定期の場合、明細表示画面に切替
          to_meisai(ssKey, typeCd);
        }
      }
    );
  } else {
    // 普通、貯蓄の場合
    varUrl = varUrl + sub_account_id + "/transactions?from=" + from + "&to=" + to + "&type=" + typeCd;
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
  
          // 明細表示画面に切替
          to_meisai(ssKey, typeCd);
        }
      }
    )
  }
};

// 口座明細表示画面へ切替
// meisai_key：sessionStorageの明細情報格納キー
// typeCd：口座科目コード
function to_meisai(meisai_key, typeCd) {
  // sessionStorageより口座残高情報取得
  var sub_accounts = JSON.parse(sessionStorage.getItem("subac_info")).sub_account;

    // 口座残高
    $("p.zandaka").empty();
    $("p.zandaka").append(formatAmount(sub_accounts.amount));
    // 口座残高時点時間
    $("p.time1").empty();
    $("p.time1").append("口座残高 " + formatDateTime(sub_accounts.sub_accounts_updated_at) + " 時点");

  // 当年月、口座明細時点時間表示(普通・貯蓄)
  if (typeCd != TYPE_CODE.TEIKI) {
    var tounengetu = new Date();
    var tounen = tounengetu.getFullYear();
    var tougetu = tounengetu.getMonth() + 1;
    $("span.nengappiCon").empty();
    $("span.nengappiCon").append(tounen + "年" + tougetu + "月");
    // 前月ボタン表示
    zengetsuDisplay(true);
    // 翌月ボタン非表示
    jigetuDisplay(false);

    // 口座明細時点時間
    // meisaiTime_口座識別子をキーに口座明細情報時点時間をsessionStorageより取得
    makeMeisaiTime(sessionStorage.getItem("meisaiTime_" + sessionStorage.getItem("key_sub_account_id")));
  };

  // sessionStorageより口座明細情報取得
  if (sessionStorage.getItem(meisai_key) != 0) {
    var meisaiData = JSON.parse(sessionStorage.getItem(meisai_key));
    // 明細表生成
    makeMeisaiTable(typeCd, meisaiData.transactions);
  } else {
    // 明細表生成(0件)
    makeNoMeisai(typeCd);
  };

  // 口座明細表示画面に遷移
  if (typeCd == TYPE_CODE.FUTSU) {
    show("page_futsuYokin");
  } else if (typeCd == TYPE_CODE.CHOCHIKU) {
    show("page_chochikuYokin");
  } else {
    show("page_teikiYokin");
  };
};

// 口座明細時点時間設定
function makeMeisaiTime(meisaiTime) {
  $("p.time2").empty();
  $("p.time2").append("お取引明細 " + formatDateTime(meisaiTime) + " 時点");
};

function makeMeisaiTable(typeCd, transactions) {
  transactions.sort(compare);
  if (typeCd != TYPE_CODE.TEIKI) {
    // 普通、貯蓄の場合
    if (typeCd == TYPE_CODE.FUTSU) {
      $('#fuMeisai').empty();
      $('#futsuErr').empty();
    } else {
      $('#choMeisai').empty();
      $('#choErr').empty();
    };
    $.each(transactions, function(i, value) {
      // 任意項目を格納する
      var content = "";

      // 任意項目のnullチェック
      if(value.content != null){
        content = value.content;
      };

      var trtd = "<tr>" + "<td class=\"dateData\">"
          // 年月日
          + formatTradingDay(value.trading_day) + "</td>" +
          // お取扱内容
          "<td class=\"textDataLarge\">" + htmlEscape(content) + "</td>";
      
      // お支払い金額
      trtd = trtd + "<td class=\"moneyData\">";
      if(value.is_income != null){
        if (value.is_income == "2") {
          trtd = trtd + formatAmount(value.line_amount);
        }else if (value.is_income == "4"){
          trtd = trtd + String(value.line_amount).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        };
      }
      trtd = trtd + "</td>";
      
      // お預り金額
      trtd = trtd + "<td class=\"moneyData\">";
      if(value.is_income != null){
        if (value.is_income == "1") {
          trtd = trtd + formatAmount(value.line_amount);
        }else if (value.is_income == "3"){
          trtd = trtd + String(value.line_amount).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        };
      }
      trtd = trtd + "</td>";

      // 差引残高
      trtd = trtd + "<td class=\"moneyData\">" + formatAmount(value.balance) + "</td>";
      
      // メモ
      if (typeCd == TYPE_CODE.FUTSU) {
        trtd = trtd + "<td class=\"textDataMemo\">" + htmlEscape(value.memo) + "</td>";
      };
      trtd = trtd + "</tr>";
      if (typeCd == TYPE_CODE.FUTSU) {
        $('#fuMeisai').append(trtd);
      } else {
        $('#choMeisai').append(trtd);
      };
    });
  } else {
    $('#teikiMeisai').empty();
    $('#teikiErr').empty();
    $.each(transactions, function(i, value) {
      // 任意項目を格納する
      var content = "";
      var period = "";
      var interestRate = "";
      var maturityDate = "";
      var maturityHandlingMethod = "";
      var taxClass = "";
      var number = "";
      
      // 任意項目のnullチェック
      if(value.content != null){
        content = value.content;
      };
      if(value.period != null){
        period = value.period;
      };
      if(value.interest_rate != null){
        interestRate = value.interest_rate.toFixed(3) + "％";
      };
      if(value.maturity_date != null){
        maturityDate = formatTradingDay(value.maturity_date);
      };
      if(value.maturity_handling_method != null){
        maturityHandlingMethod = value.maturity_handling_method;
      };
      if(value.tax_class != null){
        taxClass = value.tax_class;
      };
      if(value.number != null){
        number = value.number;
      };

      var trtd = "<tr>" +
        // お預り番号  
        "<td class=\"dateData\">" + number + "</td>" +
        // 定期預金種類
        "<td class=\"textDataLarge\">" + content + "</td>" +
        // 金額
        "<td class=\"moneyData\">" + formatAmount(value.line_amount) + "</td>" +
        // 幅調整用
        "<td class=\"blank\"></td>" +
        // 期間
        "<td class=\"riData\">" + period + "</td>" +
        // 幅調整用
        "<td class=\"blank\"></td>" +
        // 利率
        "<td class=\"riData\">" + interestRate + "</td>" +
        // 幅調整用
        "<td class=\"blank\"></td>" +
        // 年月日
        "<td class=\"dateData\">" + formatTradingDay(value.trading_day) + "</td>" +
        // 満期日／最長預入期間
        "<td class=\"dateData\">" + maturityDate + "</td>" +
        // 満期時のお取扱
        "<td class=\"textDataMedium\">" + maturityHandlingMethod + "</td>" +
        // 課税区分
        "<td class=\"textDataSmall\">" + taxClass + "</td>" +
        "</tr>";
      $('#teikiMeisai').append(trtd);
    });
  }
};

function makeNoMeisai(typeCd) {
  if (typeCd == TYPE_CODE.FUTSU){
    // 普通の場合
    $('#fuMeisai').empty();
    $('#futsuErr').empty();
    $('#futsuErr').text("明細データがありません。");
  }else if (typeCd == TYPE_CODE.CHOCHIKU){
    // 貯蓄の場合
    $('#choMeisai').empty();
    $('#choErr').empty();
    $('#choErr').text("明細データがありません。");
  }else{
    // 定期の場合
    $('#teikiMeisai').empty();
    $('#teikiErr').empty();
    $('#teikiErr').text("明細データがありません。");
  };
};

// 通帳表紙プレビュー
$(document).on('click','#btnHyoshiDL',function() {
  nidoBoushi(true);
  // 口座識別子をsessionStorageに格納
  var sub_account_id = $("#target").val();

  // 通帳表紙情報取得要求API呼出、通帳表紙プレビュー表示画面へ切替
  var varUrl = "/sp2/passbook/cover/";
  var sendUrl = varUrl + sub_account_id;

  // 通帳表紙情報取得要求API
  doGetAjax(sendUrl, null, null, null).done(
    function(json_data) {
      // 通信成功処理
      // サーバー側エラー
      if (json_data.err_code != null || json_data.err_code != undefined) {
        
        // セッション切れもしくは不正アクセスの場合ログイン画面に遷移
        if (json_data.err_code.indexOf("9") == 0) {
          reloadlogin(json_data.message);
        };

        // サーバー側エラー発生時、エラーメッセージを画面表示
        outputErrMsg(json_data.message);

      } else {
        // 通帳表紙情報をsessionStorageにJSON文字列に変換して格納
        sessionStorage.setItem("passbook_cover_info", JSON.stringify(json_data));
        to_PassBookCover();
        nidoBoushi(false);
      }
    }
  )
});

// 表紙プレビュー画面の作成
function to_PassBookCover(){
  // 推奨ブラウザに関する文言を表示
  showRecommendBrowser();
  // sessionStorageより通帳表紙情報取得
  var passbook_cover_info = JSON.parse(sessionStorage.getItem("passbook_cover_info"));
  // nullチェックしてデータを表示する
  if (passbook_cover_info == null) {
    $('#preview_type_a').empty();
    $('#preview_branch_number_a').empty();
    $('#preview_number_a').empty();
    $('#preview_user_name_kana_a').empty();
    $('#preview_branch_a').empty();
    $('#preview_branch_number').empty();
    $('#preview_number').empty();
    $('#preview_user_name').empty();
    $('#preview_cover_time').empty();
  } else {
    $('#preview_type_a').empty();
    if (getTypeVal(passbook_cover_info.type) != null) {
      $('#preview_type_a').append(getTypeVal(passbook_cover_info.type) + "預金");  
    }
    $('#preview_branch_number_a').empty();
    if (passbook_cover_info.branch_number != null) {
      $('#preview_branch_number_a').append(passbook_cover_info.branch_number);
    }
    $('#preview_number_a').empty();
    if (passbook_cover_info.number != null) {
      $('#preview_number_a').append(passbook_cover_info.number);
    }
    $('#preview_user_name_kana_a').empty();
    if (passbook_cover_info.user_name_kana != null) {
      $('#preview_user_name_kana_a').append(passbook_cover_info.user_name_kana + "　様");
    }
    // 文字数によって適用cssを変更
    var kana_name = passbook_cover_info.user_name_kana;
    var kana_count = kana_name.length;
    var str_kana_name = kana_name.toString();
    var target = document.getElementById("preview_user_name_kana_a");
    // 65文字以下
    if (kana_count < 65) {
      target.className = "name_kana65";
    }
    // 66文字以上
    else if (kana_count >= 66) {
      target.className = "name_kana66";
    } else {
      target.className = "name_kana1";
    }
    $('#preview_branch_a').empty();
    if (passbook_cover_info.branch != null) {
      $('#preview_branch_a').append(passbook_cover_info.branch);
    }
    // 文字数によって適用cssを変更
    var branch_name = passbook_cover_info.branch;
    var branch_count = branch_name.length;
    var str_branch = branch_name.toString();
    var target1 = document.getElementById("preview_branch_a");
    // 31～51文字
    if (branch_count >= 31 && branch_count <= 51) {
      target1.className = "branch_name31";
    // 52～72文字
    } else if  (branch_count >= 52 && branch_count <= 72) {
      target1.className = "branch_name52";
    // 73文字以上
    } else if (branch_count >= 73) {
      target1.className = "branch_name73";
    } else {
      target1.className = "branch_name1";
    }
    $('#preview_bank_code_a').empty();
    if (passbook_cover_info.bank_code != null) {
      $('#preview_bank_code_a').append(passbook_cover_info.bank_code);
    }
    // 通帳表紙
    $('#preview_branch_number').empty();
    if (passbook_cover_info.branch_number != null) {
      $('#preview_branch_number').append(passbook_cover_info.branch_number);
    }
    $('#preview_number').empty();
    if (passbook_cover_info.number != null) {
      $('#preview_number').append(passbook_cover_info.number);
    }
    $('#preview_user_name').empty();
    if (passbook_cover_info.user_name != null) {
      $('#preview_user_name').append(passbook_cover_info.user_name);
    }
    // 文字数によって適用cssを変更
    var user_name = passbook_cover_info.user_name;
    var str_count = user_name.length;
    var str_name = user_name.toString();
    var target1 = document.getElementById("preview_user_name");
    // 60文字以下
    if (str_count < 60) {
      target1.className = "preview_user_name60";
    }
    // 60文字以上
    else if (str_count >= 61) {
      target1.className = "preview_user_name61";
    } else {
      target1.className = "preview_user_name1";
    }
    $('#preview_cover_time').empty();
    if (passbook_cover_info.cover_time != null) {
      $('#preview_cover_time').append(passbook_cover_info.cover_time);
    }
  }
  // 画面遷移
  show("page_passbookCover_preview");
}

// 時点日付をフォーマットし変換する
// RFC3339で既定された西暦full-time形式の文字列->Date型変換->MM/DD HH:mmに変換
function formatDateTime(str_date) {
  date = new Date(str_date);
  format = 'MM/DD HH:mm';
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  return format;
};

// 日付をフォーマット変換する
// 文字列(YYYY-MM-DD)->文字列(YYYY/MM/DD)
function formatTradingDay(date) {
  return date.replace(/-/g, '/');
};

// 金額をフォーマットし変換する
function formatAmount(amount) {
  return '\xA5' + String(amount).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
};

// . 比較関数
function compare(a, b) {
  var r = 0;
  if (a.sort_serialnumber < b.sort_serialnumber) {
    r = -1;
  } else if (a.sort_serialnumber > b.sort_serialnumber) {
    r = 1;
  }

  return r;
};

// HTMLエスケープ
function htmlEscape(string) {
  if (typeof string !== 'string') {
    return string;
  }
  return string.replace(/[&'`"<>]/g, function(match) {
    return {
      '&' : '&amp;',
      "'" : '&#x27;',
      '`' : '&#x60;',
      '"' : '&quot;',
      '<' : '&lt;',
      '>' : '&gt;',
    }[match]
  });
};
