// PDFボタン押下
$(document).on('click', '#btnCoverDL', function () {
  nidoBoushi(true);
  // 口座識別子をSessionStorageから取り出す
  var sub_account_id = JSON.parse(sessionStorage.getItem("passbook_cover_info")).sub_account_id;
  // sessionStorageより通帳表紙情報取得
  var passbook_cover_info = JSON.parse(sessionStorage.getItem("passbook_cover_info"));
  
  // 通帳表紙報得要求APIPDFをダウンロード
  var bankPath = "/app_tsucho";
  var varUrl = "/sp2/passbook/cover/";
  var sendUrl = bankPath + varUrl + sub_account_id + "/pdf";

  // POSTでリクエストし別タブで開く
  var form = $('<form></form>',{action:sendUrl,target:'receiver',method:'POST'}).hide();
  var body = $('body');
  body.append(form);
  form.append($('<input>',{type:'hidden',name:'user_id',value:sessionStorage.getItem("user_id")}));
  form.append($('<input>',{type:'hidden',name:'type',value:getTypeVal(passbook_cover_info.type)}));
  window.open('','receiver');
  form.submit();
  nidoBoushi(false);
});