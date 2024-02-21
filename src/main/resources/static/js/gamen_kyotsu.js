// 口座科目の定数化
var TYPE_CODE = {
  'FUTSU' : '001',
  'CHOCHIKU' : '004',
  'TEIKI' : '006'
};
Object.freeze(TYPE_CODE);

// 口座科目変換
function getTypeVal(typeCd) {
  if (typeCd == TYPE_CODE.FUTSU) {
    return "普通";
  } else if (typeCd == TYPE_CODE.CHOCHIKU) {
    return "貯蓄";
  } else {
    return "定期";
  }
};
function getTypeCd(typeVal) {
  if (typeVal == "普通") {
    return TYPE_CODE.FUTSU;
  } else if (typeVal == "貯蓄") {
    return TYPE_CODE.CHOCHIKU;
  } else {
    return TYPE_CODE.TEIKI;
  }
};

function show(slide) {
  var page_lg = document.getElementById("page_login");
  var page_ac = document.getElementById("page_accountSelect");
  var page_ft = document.getElementById("page_futsuYokin");
  var page_ty = document.getElementById("page_teikiYokin");
  var page_cy = document.getElementById("page_chochikuYokin");
  var page_md = document.getElementById("page_meisai_download");
  var page_pp = document.getElementById("page_passbookCover_preview");
  if (slide == "page_login") {
    page_lg.style.display = "block";
    page_ac.style.display = "none";
    page_ft.style.display = "none";
    page_ty.style.display = "none";
    page_cy.style.display = "none";
    page_md.style.display = "none";
    page_pp.style.display = "none";
  } else if (slide == "page_accountSelect") {
    page_lg.style.display = "none";
    page_ac.style.display = "block";
    page_ft.style.display = "none";
    page_ty.style.display = "none";
    page_cy.style.display = "none";
    page_md.style.display = "none";
    page_pp.style.display = "none";
  } else if (slide == "page_futsuYokin") {
    page_lg.style.display = "none";
    page_ac.style.display = "none";
    page_ft.style.display = "block";
    page_ty.style.display = "none";
    page_cy.style.display = "none";
    page_md.style.display = "none";
    page_pp.style.display = "none";
  } else if (slide == "page_teikiYokin") {
    page_lg.style.display = "none";
    page_ac.style.display = "none";
    page_ft.style.display = "none";
    page_ty.style.display = "block";
    page_cy.style.display = "none";
    page_md.style.display = "none";
    page_pp.style.display = "none";
  } else if (slide == "page_meisai_download") {
    page_lg.style.display = "none";
    page_ac.style.display = "none";
    page_ft.style.display = "none";
    page_ty.style.display = "none";
    page_cy.style.display = "none";
    page_md.style.display = "block";
    page_pp.style.display = "none";
  } else if (slide == "page_passbookCover_preview") {
    page_lg.style.display = "none";
    page_ac.style.display = "none";
    page_ft.style.display = "none";
    page_ty.style.display = "none";
    page_cy.style.display = "none";
    page_md.style.display = "none";
    page_pp.style.display = "block";
  } else {
    page_lg.style.display = "none";
    page_ac.style.display = "none";
    page_ft.style.display = "none";
    page_ty.style.display = "none";
    page_cy.style.display = "block";
    page_md.style.display = "none";
    page_pp.style.display = "none";
  }
};

// ドロワーを閉じる
function closeDrawer() {
  // ドロワーを閉じる
  $('.mdl-layout__drawer').removeClass('is-visible');
  // 網掛け部を非表示
  $('.mdl-layout__obfuscator').removeClass('is-visible');
};

// 遷移してきたウィンドウを閉じる
$('#window_close').on('click', function () {
  window.open('about:blank','_self').close();
});

// ログアウト
function logout() {
  doLogoutAjax("/sp2/logout");
};

// エラーメッセージ表示・非表示
function outputErrMsg(err_msg) {
  $(".err_msg").text(err_msg);
  $('.err_msg').css('color', 'red');
  if(err_msg!=""){
    $('main').scrollTop(0);    
  }
};

// インフォメーションメッセージ表示・非表示
function outputInfoMsg(err_msg) {
  $(".err_msg").text(err_msg);
  $('.err_msg').css('color', 'black');
};

// 入力チェックエラーメッセージ表示・非表示
function outputValErrMsg(err_msg) {
  if ($(".err_msg").text() != "") {
    $(".err_msg").append("<br>");
  };
  $(".err_msg").append(err_msg);
  $('.err_msg').css('color', 'red');
};

// ボタン活性・非活性(二度押し防止)
function nidoBoushi(disabled) {
  $("#btnLogin1").prop("disabled", disabled);
  $("#btnLogin2").prop("disabled", disabled);
  $("#btnMeisai").prop("disabled", disabled);
  $("#btnHyoshiDL").prop("disabled", disabled);
  $("#futsu_backMonth").prop("disabled", disabled);
  $("#futsu_nextMonth").prop("disabled", disabled);
  $("#tyotik_backMonth").prop("disabled", disabled);
  $("#tyotik_nextMonth").prop("disabled", disabled);
  $("#target").prop("disabled", disabled);
  $("#btnMeisaiDL").prop("disabled", disabled);
  $("#btnMeisaiCSV").prop("disabled", disabled);
  $("#btnMeisaiPDF").prop("disabled", disabled);
  $("#btnCoverDL").prop("disabled", disabled);
};

// 日付をフォーマットし変換する
function formatDate(date) {
  format = 'YYYY-MM-DD';
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  return format;
};

// 日付をフォーマットし変換する(日本語)
function formatDateToJapanese(date) {
  format = 'YYYY年MM月';
  format = format.replace(/YYYY/, date.getFullYear());
  format = format.replace(/MM/, date.getMonth() + 1);
  return format;
};

// 口座選択画面表示情報初期化
function clearSelectAccountData(){
  $('#subaccount_type').empty();
  $('#subaccount_user_name').empty();
  $('#subaccount_branch_number').empty();
  $('#subaccount_branch').empty();
  $('#subaccount_number').empty();
};

// UserAgentを取得
// userAgentCH ... Google Chrome, Edgeで取得可能なUser-Agent Client Hints(UA-CH)
// userAgent ... Safari, FireFoxで取得可能なUser-Agent
var userAgentCH = navigator.userAgentData; 
var userAgent = navigator.userAgent.toLowerCase();

// OS別の推奨ブラウザ文言
const recommendBrowser = {
    pcMac : "※Safari、Fire Fox、Google Chromeでの閲覧を推奨しています。",
    pcWindows : "※Microsoft Edge、Fire Fox、Google Chromeでの閲覧を推奨しています。",
    iOS : "※Safariでの閲覧を推奨しています。",
    android : "※Google Chromeでの閲覧を推奨しています。"	,
};

// userAgentの判別処理用文言
const judgeOS = {
    iOSUaCH : "ios",
    pcMacUaCH : "macos",
    iOSUa : "iphone",
    pcMacUa : "mac",
    windows : "windows",
    android : "android",
};

// UserAgentを使用してOS別に推奨ブラウザ文言を返す
function divideTextsByUA(){
  // UA-CHが取得できた場合
  if (userAgentCH) {
    // UA-CHが取得でき、OSデータも存在する場合
    var os = userAgentCH.platform.toLowerCase();
    if(os.includes(judgeOS.iOSUaCH)){
        return recommendBrowser.iOS;
    } else if(os.includes(judgeOS.pcMacUaCH)){
        return recommendBrowser.pcMac;
    } else if (os.includes(judgeOS.windows)){
        return recommendBrowser.pcWindows;
    } else if (os.includes(judgeOS.android)){
        return recommendBrowser.android;
    // UA-CHが取得できたが、OSデータが空白であった場合(一部デバイスで発生)
    } else if (userAgent.includes(judgeOS.iOSUa)) {
        return recommendBrowser.iOS;
    } else if (userAgent.includes(judgeOS.pcMacUa)) {
        return recommendBrowser.pcMac;
    } else if (userAgent.includes(judgeOS.windows)) {
        return recommendBrowser.pcWindows;
    } else if (userAgent.includes(judgeOS.android)) {
        return recommendBrowser.android;
    } else {
        return "" ;
	};
  // UA-CHが取得できなかった場合
  } else {
    if (userAgent.includes(judgeOS.iOSUa)) {
        return recommendBrowser.iOS;
    } else if (userAgent.includes(judgeOS.pcMacUa)) {
        return recommendBrowser.pcMac;
    } else if (userAgent.includes(judgeOS.windows)) {
        return recommendBrowser.pcWindows;
    } else if (userAgent.includes(judgeOS.android)) {
        return recommendBrowser.android;
    } else {
        return "";
    };
  };
};

// 推奨ブラウザに関する文言を表示
function showRecommendBrowser() {
    $('.recommend_browser').empty();
    $('.recommend_browser').append(divideTextsByUA());
};