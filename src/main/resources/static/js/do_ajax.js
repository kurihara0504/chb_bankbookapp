// AJAX通信 GET
// varURL         : 送信先URL       ：必須
// sub_account_id : 口座識別子      ：口座明細情報取得要求APIの場合のみ
// fromDay        : 取得対象月初日  ：普通/貯蓄の口座明細情報取得要求APIの場合のみ
// typeCd         : 口座科目        ：口座明細情報取得要求APIの場合のみ
var bankPath = "/app_tsucho";
function doGetAjax(varURL, sub_account_id, fromDay, typeCd) {
  // プロトコル取得
  var lprtcl = location.protocol;
  var sendURL = bankPath + varURL;
  var dfd = $.Deferred();

  $.ajax({
    // 送信方法
    type : "GET",
    // 送信先URL
    url : sendURL,
    // ユーザー識別子をヘッダに設定
    headers : {
      'X-session-user-identification-code' : sessionStorage.getItem("user_id"),
      'X-current-user-identification-code' : sessionStorage.getItem("user_id")
    },
    // レスポンスをJSONとしてパースする
    dataType : "json",
    cache : false
  }).fail(function(jqXHR, textStatus, errorThrown) {
    // エラーメッセージのクリア
    outputErrMsg("");
    // エラーコード単位で処理を分岐する
    // 流量制限エラー発生時
    if(jqXHR.status == 502 || jqXHR.status == 504){
      // エラー出力箇所の横幅の設定
      $('.err_msg').width(400).css({textAlign:'left'});
      // エラーメッセージを画面表示
      outputErrMsg("ただいま、アクセスが集中しております。時間をあけて再度お試しください。");
    } else {
      // 返却値をJSONにパース
      var res = $.parseJSON(jqXHR.responseText);
      if(jqXHR.status == 503){
        // エラー出力箇所の横幅の設定
        $('.err_msg').width(400).css({textAlign:'left'});
        // エラーメッセージを画面表示
        outputErrMsg(res.message);
      };
    };
  }).done(function(json_data) {

    dfd.resolve(json_data);

  }).always(
      function(jqXHR, textStatus) {
        nidoBoushi(false);
        if (varURL == "/sp2/users"
            && sessionStorage.getItem("key_sub_accounts") == 0) {
          // 口座情報0件の場合明細表示ボタン、通帳表紙の表示ボタン非活性
          $("#btnMeisai").prop("disabled", true);
          $("#btnHyoshiDL").prop("disabled", true);
        };
      });
  return dfd.promise();
};

// AJAX通信 POST(認証要求API)
function doPostAjax(reqData, varURL) {
  var lprtcl = location.protocol;
  var sendURL = bankPath + varURL;
  var dfd = $.Deferred();

  $.ajax({
    type : "POST",
    url : sendURL,
    // リクエストJSONデータ本体
    data : JSON.stringify(reqData),
    // リクエストの Content-Type
    contentType : 'application/json',
    dataType : "json",
    cache : false
  }).fail(function(jqXHR, textStatus, errorThrown) {
    // エラーメッセージのクリア
    outputErrMsg("");
    // エラーコード単位で処理を分岐する
    // 流量制限エラー発生時
    if(jqXHR.status == 502 || jqXHR.status == 504){
      // エラー出力箇所の横幅の設定
      $('.err_msg').width(400).css({textAlign:'left'});
      // エラーメッセージを画面表示
      outputErrMsg("ただいま、アクセスが集中しております。時間をあけて再度お試しください。");
    } else {
      // 返却値をJSONにパース
      var res = $.parseJSON(jqXHR.responseText);
      if(jqXHR.status == 503){
        // エラー出力箇所の横幅の設定
        $('.err_msg').width(400).css({textAlign:'left'});
        // エラーメッセージを画面表示
        outputErrMsg(res.message);
      };
    };
  }).done(
    function(json_data) {
      // 通信成功処理
      if (json_data.err_code != null || json_data.err_code != undefined) {
        // サーバー側エラー発生時、エラーメッセージを画面表示
        outputErrMsg(json_data.message);
      } else {
        // サーバー側正常終了
        // エラーメッセージクリア
        outputErrMsg("");
        // 認証要求APIの場合
        // ユーザー識別子取得
        var user_id = json_data.user.identification_code;

        // ユーザー識別子をsessionStorageに格納
        sessionStorage.setItem("user_id", user_id);

        // 設定情報取得要求API呼出して、照会口座選択画面へ切替
        doGetAjax("/sp2/users", null, null, null, null).done(
          function(json_data) {
            // 通信成功処理
            // サーバー側エラー
            if (json_data.err_code != null
                || json_data.err_code != undefined) {

              // セッション切れの場合はログイン画面に遷移
              if (json_data.err_code.indexOf("9") == 0) {
                reloadlogin(json_data.message);
              };

              // サーバー側エラー発生時、エラーメッセージを画面表示
              outputErrMsg(json_data.message);
            } else {

              if (json_data.sub_accounts == undefined
                  || json_data.sub_accounts == null
                  || json_data.sub_accounts[0] == undefined
                  || json_data.sub_accounts[0] == null) {
                // 口座情報0件処理
                // 口座情報を0としてsessionStorageに格納
                sessionStorage.setItem("key_sub_accounts", 0);
              } else {

                var subAccounts = new Array();
                json_data.sub_accounts.some(function(value, i) {
                  // ログイン中のユーザの保持するアカウントに絞りこみ
                  if (value.is_session_user) {
                    subAccounts.push(value);
                  };
                });

                // Jsonデータにsub_accountsのデータを詰めなおす
                json_data.sub_accounts = subAccounts;

                if (json_data.sub_accounts.length > 0) {
                  // 口座情報をsessionStorageにJSON文字列に変換して格納
                  sessionStorage.setItem("key_sub_accounts", JSON.stringify(json_data));
                } else {
                  // 口座情報を0としてsessionStorageに格納
                  sessionStorage.setItem("key_sub_accounts", 0);
                };
              };

              // 照会口座選択画面へ切替
              to_accountSelect(true);
            };
          }
        );
      };
    }
  ).always(function(jqXHR, textStatus) {
    nidoBoushi(false);
  });
};

// AJAX通信 POST(ログアウトAPI)
function doLogoutAjax(varURL) {
  var lprtcl = location.protocol;
  var sendURL = bankPath + varURL;

  $.ajax({
    type : "POST",
    url : sendURL,
    headers : {
      'X-session-user-identification-code' : sessionStorage.getItem("user_id"),
      'X-current-user-identification-code' : sessionStorage.getItem("user_id")
    },
    contentType : 'application/json',
    dataType : "json",
    cache : false
  }).fail(function(jqXHR, textStatus, errorThrown) {
    // エラーメッセージのクリア
    outputErrMsg("");
    // エラーコード単位で処理を分岐する
    // 流量制限エラー発生時
    if(jqXHR.status == 502 || jqXHR.status == 504){
      // エラー出力箇所の横幅の設定
      $('.err_msg').width(400).css({textAlign:'left'});
      // エラーメッセージを画面表示
      outputErrMsg("ただいま、アクセスが集中しております。時間をあけて再度お試しください。");
    } else {
      // 返却値をJSONにパース
      var res = $.parseJSON(jqXHR.responseText);
      if(jqXHR.status == 503){
        // エラー出力箇所の横幅の設定
        $('.err_msg').width(400).css({textAlign:'left'});
        // エラーメッセージを画面表示
        outputErrMsg(res.message);
      };
    };
  }).done(function(json_data) {
	// 通信成功処理
    if (json_data.err_code != null || json_data.err_code != undefined) {
	    // サーバー側エラー発生時、エラーメッセージを画面表示
	    outputErrMsg(json_data.message);
	    
	    // セッション切れもしくは不正アクセスの場合ログイン画面に遷移
	    if (json_data.err_code.indexOf("9") == 0) {
	        reloadlogin(json_data.message);
	    };
	} else {
	    sessionStorage.clear();
	    // サーバー側正常終了 ログイン画面へ
	    window.location.reload(false);
	};
  });
};

// 明細CSVの取得
function doGetCSVAjax(varURL, sub_account_id, fromDay, typeCd) {
  // プロトコル取得
  var lprtcl = location.protocol;
  var sendURL = bankPath + varURL;
  var dfd = $.Deferred();

  $.ajax({
    // 送信方法
    type : "GET",
    // 送信先URL
    url : sendURL,
    // ユーザー識別子をヘッダに設定
    headers : {
      'X-session-user-identification-code' : sessionStorage.getItem("user_id"),
      'X-current-user-identification-code' : sessionStorage.getItem("user_id")
    },
    cache : false
  }).fail(function(jqXHR, textStatus, errorThrown) {
    // エラーメッセージのクリア
    outputErrMsg("");
    // エラーコード単位で処理を分岐する
    // 流量制限エラー発生時
    if(jqXHR.status == 502 || jqXHR.status == 504){
      // エラー出力箇所の横幅の設定
      $('.err_msg').width(400).css({textAlign:'left'});
      // エラーメッセージを画面表示
      outputErrMsg("ただいま、アクセスが集中しております。時間をあけて再度お試しください。");
    } else {
      // 返却値をJSONにパース
      var res = $.parseJSON(jqXHR.responseText);
      if(jqXHR.status == 503){
        // エラー出力箇所の横幅の設定
        $('.err_msg').width(400).css({textAlign:'left'});
        // エラーメッセージを画面表示
        outputErrMsg(res.message);
      };
    };
  }).done(function(data, textStatus, jqXHR) {
    // サーバー側エラー
    if (data.err_code != null || data.err_code != undefined) {
      // セッション切れもしくは不正アクセスの場合ログイン画面に遷移
      if (data.err_code.indexOf("9") == 0) {
        reloadlogin(data.message);
      };
      // サーバー側エラー発生時、エラーメッセージを画面表示
      outputErrMsg(data.message);
    } else {
      let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
      let downloadData = new Blob([bom, data], {type: 'text/csv'});
      // ファイル名の取得
      var filename = "";
      var disposition = jqXHR.getResponseHeader('Content-Disposition');
      if (disposition && disposition.indexOf('attachment') !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
        };
      };
      // IE用
      if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(downloadData, filename);
      } else {
        let downloadUrl  = (window.URL || window.webkitURL).createObjectURL(downloadData);
        let link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.click();
        (window.URL || window.webkitURL).revokeObjectURL(downloadUrl);
      };
    };
    dfd.resolve(data);
  }).always(
      function(jqXHR, textStatus) {
        nidoBoushi(false);
      });
  return dfd.promise();
};