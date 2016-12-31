var settings_dialog_content_frame_lite = `
<div id="TabbedPanels1" class="TabbedPanels">
  <ul class="TabbedPanelsTabGroup">
    <li class="TabbedPanelsTab" tabindex="0">Settings</li>
    <li class="TabbedPanelsTab" tabindex="0">About</li>
  </ul>
  <div class="TabbedPanelsContentGroup">
    <div class="TabbedPanelsContent">

      <p>
      <div class="ui-expense-label">Current session:</div> <a class="validate-modal-dialog" href="#" id="btn-logout">Logout </a>
      </p>

      <p>
        <div class="ui-expense-label">History:</div>
        <select id="settings-history-combo" onchange="adjustHistory()">  
          <option value="3">three months</option>
          <option value="4">four months</option>
          <option value="5">five months</option>
          <option value="6">six months</option>
          <option value="7">seven months</option>
          <option value="8">height months</option>
          <option value="9">nine months</option>
          <option value="10">ten months</option>
          <option value="11">eleven months</option>
          <option value="12">twelve months</option>
        </select>
      </p>

      <p>
        <div class="ui-expense-label">Language:</div>
        <select id="settings-language-combo">  
          <option value="3">english</option>
        </select>
      </p>

      <p>
        <div class="ui-expense-label">UI skin:</div>
        <select id="settings-skin-combo" onchange="changeTheme()">  
          <option value="dark">dark metal</option>
          <option value="light">light</option>
        </select>
      </p>


    </div>


    <div class="TabbedPanelsContent" style="text-align:center;">
      <p><img src="img/icons/icon@87x87.png"></p>
      <p>
        <a href="http://buddjet.projectfurnace.org">Buddjet</a> version 0.1<br/>By Fabrice Rasoamiaramanana
      </p>
      <p><a class="validate-modal-dialog"  href="#" id="btn-launch-tutorial" data-dismiss="modal">Launch tutorial</a></p>

    </div>
  </div>
</div>`;









var settings_dialog_content_frame = `
<div id="TabbedPanels1" class="TabbedPanels">
  <ul class="TabbedPanelsTabGroup">
    <li class="TabbedPanelsTab" tabindex="0">Settings</li>
    <li class="TabbedPanelsTab" tabindex="0">Customization</li>
    <li class="TabbedPanelsTab" tabindex="0">About</li>
  </ul>
  <div class="TabbedPanelsContentGroup">
    <div class="TabbedPanelsContent">

      <p>
      <div class="ui-expense-label">Current session:</div> <a class="validate-modal-dialog" href="#" id="btn-logout">Logout </a>
      </p>

      <p>
        <div class="ui-expense-label">History:</div>
        <select id="settings-history-combo" onchange="adjustHistory()">  
          <option value="3">three months</option>
          <option value="4">four months</option>
          <option value="5">five months</option>
          <option value="6">six months</option>
          <option value="7">seven months</option>
          <option value="8">height months</option>
          <option value="9">nine months</option>
          <option value="10">ten months</option>
          <option value="11">eleven months</option>
          <option value="12">twelve months</option>
        </select>
      </p>

      <p>
        <div class="ui-expense-label">Language:</div>
        <select id="settings-language-combo">  
          <option value="3">english</option>
        </select>
      </p>

      <p>
        <div class="ui-expense-label">UI skin:</div>
        <select id="settings-skin-combo" onchange="changeTheme()">  
          <option value="dark">dark metal</option>
          <option value="light">light</option>
        </select>
      </p>


    </div>
    <div class="TabbedPanelsContent">
      <p>Add rename or delete:</p>

      <p>
        <select id="settings-category-combo-add">  
        </select>
        <input type="text" id="settings-new-expense-input-caption">
        <a class="validate-modal-dialog"  href="#"  id="btn-add-new-entry">add new</a>
      </p>

      <p>
        <select id="settings-all-expenses-combo">  
        </select>
        <input type="text" id="settings-expense-input-new-caption">
        <a class="validate-modal-dialog"  href="#" id="btn-rename-entry">rename</a>
      </p>

      <p>
        <select id="settings-category-combo-rename">  
        </select>
        <input type="text" id="settings-category-input-new-caption">
        <a class="validate-modal-dialog"  href="#" id="btn-rename-category">rename</a>
      </p>

      <p>
        <select id="settings-category-combo-delete" onchange="populateDeleteItemCombo()">  
        </select>
        <select id="settings-expense-combo">  
        </select>
        <a class="validate-modal-dialog"  href="#" id="btn-delete-entry">delete</a>
      </p>

    </div>

    <div class="TabbedPanelsContent" style="text-align:center;">
      <p><img src="img/icons/icon@87x87.png"></p>
      <p>
        <a href="http://buddjet.projectfurnace.org">Buddjet</a> version 0.1<br/>By Fabrice Rasoamiaramanana
      </p>
      <p><a class="validate-modal-dialog"  href="#" id="btn-launch-tutorial" data-dismiss="modal">Launch tutorial</a></p>

    </div>
  </div>
</div>`;


function adjustHistory()
{
  number_of_displayed_months = Number($('#settings-history-combo').val());
  var session = localStorage.getItem(app_id + ".logged-in-session");
  localStorage.setItem(app_id + "." + session + ".history-length", number_of_displayed_months,toString());

}

function changeTheme()
{
  dark_theme = $('#settings-skin-combo').val() == "dark";
  var session = localStorage.getItem(app_id + ".logged-in-session");
  localStorage.setItem(app_id + "." + session + ".theme", $('#settings-skin-combo').val());

  window.location.href = "login.html";
}


function populateCategoryCombo()
{
  var result = '<option value=""> Category </option>';
  for (var i = 0; i < user_data.categories.length; i++)
  {
    var categoryId = user_data.categories[i].category;
    var caption = user_data.categories[i].caption;
    result += '<option value="' + categoryId + '">' + caption + '</option>';
  }
  $('#settings-category-combo-delete').html(result);
  $('#settings-category-combo-add').html(result);
  $('#settings-category-combo-rename').html(result);
}

function populateDeleteItemCombo()
{
  var category = $('#settings-category-combo-delete').val();
  var result = "";
  var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
  if (categoryObjects != null)
  {
    for (var i = 0; i < categoryObjects[0].expenses.length; i++)
    {
      var id = categoryObjects[0].expenses[i].id;
      var caption = categoryObjects[0].expenses[i].caption;

      result += '<option value="' + id + '">' + caption + '</option>';
    }
  }
  $('#settings-expense-combo').html(result);
}

function populateAllItemsCombo()
{
  var result = '<option value="">Entry</option>';
  for (var i = 0; i < user_data.categories.length; i++)
  {
    var categoryObj = user_data.categories[i];

    for (var j = 0; j < categoryObj.expenses.length; j++)
    {
      var id = categoryObj.expenses[j].id;
      var caption = categoryObj.expenses[j].caption;

      result += '<option value="' + id + '">' + caption + '</option>';
    }
  }
  $('#settings-all-expenses-combo').html(result);
}


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function addExpense(category)
{

  var reloadDialogContent = false;
  if (category === null  ||  typeof(category) === "undefined")
  {
    category = $('#settings-category-combo-add').val();
    reloadDialogContent = true;
  }

  


  var caption = $('#settings-new-expense-input-caption').val();
  if (category != '' && caption != '')
  {
    var id = guid();
    var newExpense = {
      "id": id,
      "caption": caption,
      "frequency": "monthly",
      "value": 0,
      "monthlyProjection": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      "yearlyProjection": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      "monthlyTotals": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
    var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
    if (categoryObjects != null && categoryObjects[0] != null)
    {
      categoryObjects[0].expenses.push(newExpense);

      expenseEntry(caption, "monthly", 0, id, category);


      var cmd = {
        "type" : "add-expense",
        "category" : category,
        "id" : id,
        "caption" : caption
      }

      prepareCommit(cmd);
      commitChangeLocaly(false);


      if (reloadDialogContent)
        injectSettingsDialogContent();
    }
  }
}

function removeExpense(id, category)
{
  var reloadDialogContent = false;
  if (category === null  ||  typeof(category) === "undefined")
  {
    category = $('#settings-category-combo-delete').val();
    reloadDialogContent = true;
  }

  if (id === null  ||  typeof(id) === "undefined")
  {
    id = $('#settings-expense-combo').val();
    reloadDialogContent = true;
  }



  if (category != '' && id != '')
  {

    var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
    if (categoryObjects != null && categoryObjects[0] != null)
    {
      var index = categoryObjects[0].expenses.findIndex(
          function(item)
          {
            return item.id == id;
          }
        );

      if (index != -1)
      {
        categoryObjects[0].expenses.splice(index,1);

        var cmd = {
          "type" : "remove-expense",
          "category" : category,
          "id" : id
        }

        $('#' + id).remove();

        prepareCommit(cmd);
        commitChangeLocaly(false);

        if (reloadDialogContent)
          injectSettingsDialogContent();
      }
    }
  }
}

function renameExpense(id)
{
  var reloadDialogContent = false;
  if (id === null  ||  typeof(id) === "undefined")
  {
    id = $('#settings-all-expenses-combo').val();
    reloadDialogContent = true;
  }


  var caption = $('#settings-expense-input-new-caption').val();

  if (id != '' && caption != '')
  {
    for (var i = 0; i < user_data.categories.length; i++)
    {
      var categoryObj = user_data.categories[i];

      for (var j = 0; j < categoryObj.expenses.length; j++)
      {
        var currentId = categoryObj.expenses[j].id;
        if (currentId == id)
        {
          categoryObj.expenses[j].caption = caption;

          var cmd = {
            "type" : "change-expense-caption",
            "category" : categoryObj.category,
            "id" : currentId,
            "caption" : caption
          };

          $("#ui-expense-label" + id).text(caption);

          prepareCommit(cmd);
          commitChangeLocaly(false);

          if (reloadDialogContent)
            injectSettingsDialogContent();

          return;
        }
      }
    }
  }
}

function renameCategory(category)
{

  var reloadDialogContent = false;
  if (category === null  ||  typeof(category) === "undefined")
  {
    category = $('#settings-category-combo-rename').val();
    reloadDialogContent = true;
  }
  
  var caption = $('#settings-category-input-new-caption').val();

  if (category != '' && caption != '')
  {
    var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
    if (categoryObjects != null && categoryObjects[0] != null)
    {
      categoryObjects[0].caption = caption;

      var cmd = {
        "type" : "change-category-caption",
        "category" : category,
        "caption" : caption
      };

      $("." + category).text(caption);
      $('#' + category + '-sidebar-entry').text(caption);

      prepareCommit(cmd);
      commitChangeLocaly(false);

      if (reloadDialogContent)
        injectSettingsDialogContent();
    }
  }

}


function validateSettings()
{
  refreshCurrentPage();

  //synchronizeWithServer(
  //  function() { window.location.href = "index.html"; }
  //);

}

function logMeOut()
{
  window.location.href = "logout.html";
}

function launchTutorialFromSettings()
{
  setTimeout(function(){ launchTutorial(); }, 100);
 
}


function injectSettingsDialogContent()
{
  $('#setting-dialog-content').html(pro_version ? settings_dialog_content_frame : settings_dialog_content_frame_lite);
  var TabbedPanels1 = new Spry.Widget.TabbedPanels("TabbedPanels1");
  populateCategoryCombo();
  populateAllItemsCombo();

  $('#btn-add-new-entry').unbind().click(addExpense);
  $('#btn-delete-entry').unbind().click(removeExpense);
  $('#btn-rename-entry').unbind().click(renameExpense);
  $('#btn-rename-category').unbind().click(renameCategory);
  $('#btn-validate-settings').unbind().click(validateSettings);
  $('#btn-logout').unbind().click(logMeOut);

  $('#btn-launch-tutorial').unbind().click(launchTutorialFromSettings);  

  $('#settings-history-combo').val(number_of_displayed_months);
  $('#settings-skin-combo').val(dark_theme ? "dark" : "light");
}

function injectCustomizeEntryDialogContent(id, category)
{
  var caption = "";

  var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
  if (categoryObjects != null)
  {
    var expenseObject = categoryObjects[0].expenses.filter(
      function(item) 
      { 
        return (item !== null && item.id !== null && item.id == id); 
      }
    );
    if (expenseObject != null)
      caption = expenseObject[0].caption;
  }

  


  var html = `
      <p>
        <input type="text" id="settings-expense-input-new-caption" value="` + caption + `">
        <a class="validate-modal-dialog"  href="#" id="btn-rename-entry" data-dismiss="modal">rename</a>
        &nbsp;&nbsp;or&nbsp;&nbsp;
        <a class="validate-modal-dialog"  href="#" id="btn-delete-entry" data-dismiss="modal">delete</a>
      </p>`;

  $('#setting-dialog-content').html(html);

  setTimeout(
    function()
    {
      $('#btn-delete-entry').unbind().click( function() { removeExpense(id, category); validateSettings(); } );
      $('#btn-rename-entry').unbind().click( function() { renameExpense(id); validateSettings();} );
    },
    100
  );
}

function injectCustomizeCategoryDialogContent(category)
{
  var caption = "";
  var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
  if (categoryObjects != null)
  {
    caption = categoryObjects[0].caption;
  }

  var html = `
      <p>
        <input type="text" id="settings-category-input-new-caption" value="` + caption + `">
        <a class="validate-modal-dialog"  href="#" id="btn-rename-category" data-dismiss="modal">rename</a>
      </p>
        <p>------------------&nbsp;&nbsp;or&nbsp;&nbsp------------------</p>
      <p>
        <input type="text" id="settings-new-expense-input-caption" value="new entry">
        <a class="validate-modal-dialog"  href="#" id="btn-add-new-entry" data-dismiss="modal" >add</a>
      </p>`;

  $('#setting-dialog-content').html(html);

  setTimeout(
    function()
    {
      $('#btn-add-new-entry').unbind().click( function() { addExpense(category); validateSettings(); } );
      $('#btn-rename-category').unbind().click( function() { renameCategory(category); validateSettings(); } );
    },
    100
  );
}
