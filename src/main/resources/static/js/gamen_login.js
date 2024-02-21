// 初期表示
window.onload = function() {
  // セッションストレージをクリアする
  sessionStorage.clear();
};

// セッション切れで再表示
function reloadlogin(message) {
  // セッションストレージをクリアする
  sessionStorage.clear();

  $("#btnLogin1").prop("disabled", true);
  $("#btnLogin2").prop("disabled", true);
  $("#fixed-tab-2").removeClass("is-active");
  $("#fixed-tab-1").addClass("is-active");
  $("#mdl-tabs__tab-2").removeClass("is-active");
  $('#mdl-tabs__tab-1').addClass("is-active");
  clearSelectAccountData();
  $('#target').empty();

  // login画面に遷移
  show("page_login");
  $(".mdl-textfield__input").val("");
  $("#login_user_name").removeClass("is-dirty");
  $("#login_password1").removeClass("is-dirty");
  $("#login_branch_number").removeClass("is-dirty");
  $("#login_account_number").removeClass("is-dirty");
  $("#login_password2").removeClass("is-dirty");
  outputErrMsg(message);
};

// パスワード表示・非表示(ユーザータブ)
function pwchange_usertab(e) {
  na = document.getElementById("pass_hyoji1");
  pass = document.getElementById("login_pass1");
  if (na.innerText == "パスワードを表示") {
    pass.setAttribute("type", "text");
    na.innerText = "パスワードを非表示";
  } else {
    pass.setAttribute("type", "password");
    na.innerText = "パスワードを表示";
  }
};

// パスワード表示・非表示(店番号・口座番号タブ)
function pwchange_misetab(e) {
  na = document.getElementById("pass_hyoji2");
  pass = document.getElementById("login_pass2");
  if (na.innerText == "パスワードを表示") {
    pass.setAttribute("type", "text");
    na.innerText = "パスワードを非表示";
  } else {
    pass.setAttribute("type", "password");
    na.innerText = "パスワードを表示";
  }
};

// ログイン画面入力チェック
$('#user_name').keyup(function() {
  inputCheckUser();
});
$('#login_pass1').keyup(function() {
  inputCheckUser();
});
$('#branch_number').keyup(function() {
  inputCheckMise();
});
$('#account_number').keyup(function() {
  inputCheckMise();
});
$('#login_pass2').keyup(function() {
  inputCheckMise();
});

$('#user_name').keydown(function() {
  inputCheckUser();
});
$('#login_pass1').keydown(function() {
  inputCheckUser();
});
$('#branch_number').keydown(function() {
  inputCheckMise();
});
$('#account_number').keydown(function() {
  inputCheckMise();
});
$('#login_pass2').keydown(function() {
  inputCheckMise();
});

// ユーザー名タブのログインボタン活性非活性チェック
function inputCheckUser() {
  if ($("#user_name").val() == "" || $("#login_pass1").val() == "") {
    // 未入力あり ログインボタン非活性
    $("#btnLogin1").prop("disabled", true);
  } else {
    // 未入力なし ログインボタン活性
    $("#btnLogin1").prop("disabled", false);
  }
};

// 店番号・口座番号タブのログインボタン活性非活性チェック
function inputCheckMise() {
  if ($("#branch_number").val() == "" || $("#account_number").val() == ""
      || $("#login_pass2").val() == "") {
    // 未入力あり ログインボタン非活性
    $("#btnLogin2").prop("disabled", true);
  } else {
    // 未入力なし ログインボタン活性
    $("#btnLogin2").prop("disabled", false);
  }
};

// ダイアログの登録
var dialog = document.querySelector('dialog');
if(! dialog.showModal) {
  dialogPolyfill.registerDialog(dialog);
};

// パスワードを忘れた方押下でダイアログ表示
$('.show-dialog').on('click',function(){
  dialog.showModal();
});

// 設定しないボタン押下でダイアログを閉じる
$('#btnClose').on('click',function(){
  dialog.close();
});

// 設定するボタン押下でパスワードの再設定画面へ遷移とダイアログを閉じる
$('#btnResetPass').on('click',function(evt){
  window.open("https://id.chibabank.co.jp/chiba/user/#!/usermenu/SUM650", "", "");
  dialog.close();
});

// ログインでお困りの方ボタン押下でよくあるご質問へ遷移
$('.btnFaq').on('click',function(){
  window.open("https://qa.chibabank.co.jp/?pcategory=%E3%81%A1%E3%81%B0%E3%81%8E%E3%82%93ID&ccategory=%E3%81%A1%E3%81%B0%E3%81%8E%E3%82%93ID%E5%85%A8%E8%88%AC", "", "");
});

// ログインボタン押下(ユーザー名タブ)
$(document).on('click', '#btnLogin1', function() {
  outputErrMsg("");
  var validate = false;
  if (checkUserName($("#user_name").val())) {
    // ユーザー名バリデーションチェック
    validate = true;
  };
  if (checkPassword($("#login_pass1").val())) {
    // パスワードバリデーションチェック
    validate = true;
  };
  if (validate) {
    $('main').scrollTop(0);  
    return;
  };
  nidoBoushi(true);

  // 認証要求API,設定情報取得要求API呼出、照会口座選択画面へ切替
  var user_data = {
    sign_in_session_service : {
      user_name : $("#user_name").val(),
      password : $("#login_pass1").val(),
      branch_number : null,
      account_number : null,
      is_first_login_access : true
    }
  };
  doPostAjax(user_data, "/sp2/sessions");
});

// ログインボタン押下(店番号・口座番号タブ)
$(document).on('click', '#btnLogin2', function() {
  outputErrMsg("");
  var validate = false;
  if (checkBranch($("#branch_number").val())) {
    // 店番号バリデーションチェック
    validate = true;
  };
  if (checkAccNum($("#account_number").val())) {
    // 口座番号バリデーションチェック
    validate = true;
  };
  if (checkPassword($("#login_pass2").val())) {
    // パスワードバリデーションチェック
    validate = true;
  };
  if (validate) {
    $('main').scrollTop(0);   
    return;
  };
  nidoBoushi(true);

  // 認証要求API,設定情報取得要求API呼出、照会口座選択画面へ切替
  var user_data = {
    sign_in_session_service : {
      user_name : null,
      password : $("#login_pass2").val(),
      branch_number : $("#branch_number").val(),
      account_number : $("#account_number").val(),
      is_first_login_access : true
    }
  };
  doPostAjax(user_data, "/sp2/sessions");
});

// 照会口座選択画面へ切替
function to_accountSelect(fromLogin) {

  // ハンバーグの照会口座選択押下時
  if (!fromLogin) {
    // sessionStorageより口座残高情報、口座明細情報クリア
    sessionStorage.removeItem("subac_info");
    var keylist = new Array();
    for (var i = 0; i < sessionStorage.length; i++) {
      // キーに「ユーザー識別子_」または「meisaiTime_」が含まれる場合
      if (sessionStorage.key(i).match(sessionStorage.getItem("user_id") + "_")
          || sessionStorage.key(i).match("meisaiTime_")) {
        keylist.push(sessionStorage.key(i));
      }
    }
    for (var i = 0; i < keylist.length; i++) {
      sessionStorage.removeItem(keylist[i]);
    }

    // ドロワーを閉じる
    closeDrawer();
  }

  // 口座選択リストボックス表示およびエラーメッセージクリア
  document.getElementById("target").style.display = "block";
  outputErrMsg("");

  // ログイン画面からの遷移
  if (fromLogin) {
    // sessionStorageより口座情報取得
    if (sessionStorage.getItem("key_sub_accounts") != 0) {
      var sub_accounts = JSON.parse(sessionStorage.getItem("key_sub_accounts")).sub_accounts;
      // 画面生成
      // 口座選択リストボックス
      $.each(sub_accounts, function(i, value) {
        // ソートのためにINDEX付与
        var selText = getTypeVal(value.type);
        if (selText == "普通") {
          selText = "1" + selText;
        } else if (selText == "定期") {
          selText = "2" + selText;
        } else {
          selText = "3" + selText;
        }
        $('#target').append(
            $("<option>").val(value.sub_account_id).text(selText + "預金　" + value.number)
        );
      });
      // 口座選択リストボックスのソート
      var item = $("#target").children().sort(function(a, b) {
        // textでソート
        var sortA = a.text;
        var sortB = b.text;
        if (sortA > sortB) {
          return 1;
        } else if (sortA < sortB) {
          return -1;
        } else {
          return 0;
        }
      });
      $("#target").append(item);

      // 口座選択リストボックスの設定、および各項目の設定
      $.each($("#target").children(), function(cnt, selectVal) {
        if (selectVal.text.match("1普通")) {
          selectVal.text = selectVal.text.replace("1普通", "普通");
        } else if (selectVal.text.match("2定期")) {
          selectVal.text = selectVal.text.replace("2定期", "定期");
        } else {
          selectVal.text = selectVal.text.replace("3貯蓄", "貯蓄");
        }
        if (cnt == 0) {
          // リストボックスの1件目に紐づくデータを各項目に設定
          $.each(sub_accounts, function(i, value) {
            if (selectVal.value == value.sub_account_id) {
              // リストボックスの1件目を選択状態にする
              $("#target").val(selectVal.value);
              $('#subaccount_type').append(getTypeVal(value.type) + "預金");
              $('#subaccount_user_name').append(value.user_name);
              $('#subaccount_branch_number').append(value.branch_number);
              $('#subaccount_branch').append(value.branch);
              $('#subaccount_number').append(value.number);
            }
          });
        }
      });
    } else {
      // 口座情報が0件の場合の口座選択リストボックス非表示
      document.getElementById("target").style.display = "none";
      outputInfoMsg("口座が登録されていません。");
    }
  }

  // 照会口座選択画面に遷移
  show("page_accountSelect");

};

// 全角チェック
function checkZenkaku(txt) {

  var i = txt.length, escapeTxt;

  while (i--) {
    escapeTxt = escape(txt.substring(i, i + 1));
    if (escapeTxt.length >= 6) {
      return true;
    }
  }
  return false;
};

// 桁数チェック
function checkKeta(txt, min, max) {

  if (txt.length < min || txt.length > max) {
    return true;
  };
  return false;
};

// パスワード入力チェック
function checkPassword(txt) {

  var chk = false;

  // 全角NG
  if (checkZenkaku(txt)) {
    chk = true;
  };

  // 桁数NG
  if (checkKeta(txt, 8, 20)) {
    chk = true;
  };

  if (chk) {
    outputValErrMsg("パスワードは半角8桁以上20桁以下で入力してください。");
  };

  return chk;

};

// ユーザー名入力チェック(半角6桁以上253桁以下)
function checkUserName(txt) {

  var chk = false;

  // 全角NG
  if (checkZenkaku(txt)) {
    chk = true;
  };

  // 桁数NG
  if (checkKeta(txt, 6, 253)) {
    chk = true;
  };

  if (chk) {
    outputValErrMsg("ユーザー名は半角6桁以上253桁以下で入力してください。");
  };

  return chk;
};

// 店番号入力チェック(半角数値3桁)
function checkBranch(txt) {

  if (!txt.match(/^[0-9]{3}$/)) {
    outputValErrMsg("店番号は半角数字3桁で入力してください。");
    return true;
  };

  return false;

};

// 口座番号入力チェック(半角数値7桁)
function checkAccNum(txt) {

  if (!txt.match(/^[0-9]{7}$/)) {
    outputValErrMsg("口座番号は半角数字7桁で入力してください。");
    return true;
  };

  return false;
};

// 口座番号フォーカスアウト(店番号・口座番号タブ)
document.getElementById("account_number").addEventListener('focusout', function() {
	var account_number = document.getElementById("account_number").value;
	// 1桁以上（空欄ではない）かつ6桁以下の場合、口座番号を0埋め
	if (!checkKeta(account_number,1, 6)) {
		document.getElementById("account_number").value = ('0000000' + account_number).slice(-7);
	};
});
