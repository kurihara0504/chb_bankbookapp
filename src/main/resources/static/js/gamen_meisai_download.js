// CSVボタン押下
$(document).on('click', '#btnMeisaiCSV', function() {
  nidoBoushi(true);
  // 口座識別子をSessionStorageから取り出す
  var sub_account_id = sessionStorage.getItem("key_sub_account_id");
  // 口座リストから口座識別子に対応する科目を取得する
  var sub_accounts = JSON.parse(sessionStorage.getItem("key_sub_accounts")).sub_accounts;
  var typeCd = "";
  $.each(sub_accounts, function (i, value) {
    if (sub_account_id == value.sub_account_id) {
      typeCd = value.type;
    }
  });
  if (getTypeVal(typeCd) == '普通' || getTypeVal(typeCd) == '貯蓄') {
    varUrl = "/sp2/passbook/accounts/" + sub_account_id + "/transactions/csv?from=" + sessionStorage.getItem("from_year_month") + "&to=" + sessionStorage.getItem("to_year_month") + "&type=" + typeCd;
  } else {
    varUrl = "/sp2/passbook/accounts/" + sub_account_id + "/transactions/csv?type=" + typeCd;
  }
  
  let data = doGetCSVAjax(varUrl);
  nidoBoushi(false);
});

// PDFボタン押下
$(document).on('click', '#btnMeisaiPDF', function () {
  nidoBoushi(true);
  // 口座識別子をSessionStorageから取り出す
  var sub_account_id = sessionStorage.getItem("key_sub_account_id");
  // 口座リストから口座識別子に対応する科目を取得する
  var sub_accounts = JSON.parse(sessionStorage.getItem("key_sub_accounts")).sub_accounts;
  var typeCd = "";
  var branch_number = "";
  var number = "";
  $.each(sub_accounts, function (i, value) {
    if (sub_account_id == value.sub_account_id) {
      typeCd = value.type;
      branch_number = value.branch_number;
      number = value.number;
    }
  });
  var varUrl = "/app_tsucho/sp2/passbook/accounts/";
  var sendUrl = varUrl + sub_account_id + "/transactions/pdf";

  // POSTでリクエストし別タブで開く
  var form = $('<form></form>',{action:sendUrl,target:'receiver',method:'POST'}).hide();
  var body = $('body');
  body.append(form);
  if (getTypeVal(typeCd) == '普通' || getTypeVal(typeCd) == '貯蓄') {
    form.append($('<input>',{type:'hidden',name:'from',value:sessionStorage.getItem("from_year_month")}));  
    form.append($('<input>',{type:'hidden',name:'to',value:sessionStorage.getItem("to_year_month")}));
  }
  form.append($('<input>',{type:'hidden',name:'type',value:typeCd}));
  form.append($('<input>',{type:'hidden',name:'user_id',value:sessionStorage.getItem("user_id")}));
  form.append($('<input>',{type:'hidden',name:'branch_number',value:branch_number}));
  form.append($('<input>',{type:'hidden',name:'number',value:number}));
  window.open('','receiver');
  form.submit();
  nidoBoushi(false);
});

// 年月プルダウン選択from
$('#from_year_month').change(function () {
  // 選択した要素のvalueを取り出す
  var option_value = $('[name=from] option:selected').val();
  sessionStorage.setItem("from_year_month", option_value);
  check_from_to();
});

// 年月プルダウン選択to
$('#to_year_month').change(function () {
  // 選択した要素のvalueを取り出す
  var option_value = $('[name=to] option:selected').val();
  sessionStorage.setItem("to_year_month", option_value);
  check_from_to();
});

// fromよりtoが過去ならDLボタンを非活性にする
function check_from_to() {
  var from = sessionStorage.getItem('from_year_month');
  var to = sessionStorage.getItem('to_year_month');
  var from_d = new Date(from);
  var to_d = new Date(to);
  if (from_d > to_d) {
    // ボタンを無効化
    $('.err_msg').empty();
    $('#btnMeisaiCSV').prop('disabled', true);
    $('#btnMeisaiPDF').prop('disabled', true);
    outputValErrMsg("終了月は開始月より過去に設定しないでください。");
  } else {
    // ボタンを有効化
    $('.err_msg').empty();
    $('#btnMeisaiCSV').prop('disabled', false);
    $('#btnMeisaiPDF').prop('disabled', false);
  }
};

// お取引明細に戻る
function meisai_back() {
  var accounts = JSON.parse(sessionStorage.getItem("key_sub_accounts")).sub_accounts;
  var sub_account_id = sessionStorage.getItem("key_sub_account_id");
  $.each(accounts, function(i, value) {
    if (value.sub_account_id == sub_account_id) {
      if (getTypeVal(value.type) == "普通") {
        closeDrawer();
        show("page_futsuYokin");
      } else if (getTypeVal(value.type) == "貯蓄") {
        closeDrawer();
        show("page_chochikuYokin");
      } else {
        closeDrawer();
        show("page_teikiYokin");
      };
    }
  });
}