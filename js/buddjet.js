
// declare global variables here
var expenseDonutChart;
var balanceBarChart;
var tendencyBarChart;

var updateCharts;




function findCategory(category, data)
{
  if (data !== null && data.categories !== null)
  {
    var categoryObjects = data.categories.filter(
      function(item)
      {
        return (item !== null && item.category !== null && item.category == category); 
      }
    );

    if (categoryObjects !== null && categoryObjects.length !== 0)
    {
      return categoryObjects[0];
    }
  }
  return null;
}


function findItem(category, id, data)
{
  var categoryObject = findCategory(category, data);
  if (categoryObject !== null && categoryObject.expenses !== null)
  {
    var expenseObjects = categoryObject.expenses.filter(
      function(item) 
      { 
        return (item !== null && item.id !== null && item.id == id); 
      }
    );
  }

  if (expenseObjects !== null && expenseObjects.length !== 0)
  {
    return expenseObjects[0];
  }
  return null;
}


function doubleDigitPrecision(n)
{
  return Math.floor(n * 100.0) / 100.0;
}


function launchTutorial()
{
  var maxW = $(window).width();
  var maxH = $(window).height() * 0.8;

  maxW = maxH > maxW * 0.5625 ? maxW : maxH / 0.5625;

  var w = Math.floor( maxW * 0.9) - 30;
  var h = Math.floor(w * 0.5625);

  $('#tutorial-dialog > .modal-dialog').css("width", (w + 30).toString() + "px");

  var html = '<iframe width="' + w.toString()+ '" height="' + h.toString() + '" src="https://www.youtube.com/embed/UmInkhWS0ao" frameborder="0" allowfullscreen id="tutorial-video-container"></iframe>';
  $('#tutorial-dialog-content').html(html);

  $('#tutorial-dialog').modal();  
}


function encodeData(data)
{
  var data_raw = JSON.stringify(data);

  huffman = Huffman.treeFromText(data_raw); // generate the tree
  treeEncoded = huffman.encodeTree(); // will return an javascript array with tree representation
  
  treeJSON = JSON.stringify(treeEncoded); // get a JSON string for easy transportation 

  var encoded_data = huffman.encode(data_raw);

  var t = treeJSON.replace("'", "\'");
  var d = encoded_data.replace("'", "\'");

  return JSON.stringify( { t : t, d :  d});
  //return JSON.stringify( { t : treeJSON, d :  encoded_data});
}

function decodeData(raw_data)
{

  var data = JSON.parse(raw_data);
  {
    if (data != null && typeof(data) != "undefined" && data.t != null && typeof(data.t) != "undefined" && data.d != null && typeof(data.d) != "undefined")
    {
      var t = data.t.replace("\'", "'");
      var d = data.d.replace("\'", "'");


      var tree = Huffman.Tree.decodeTree(JSON.parse(t)); // restore the tree based on array representation
      var d_data = tree.decode(d);
      return JSON.parse(d_data);

      //var tree = Huffman.Tree.decodeTree(data.t); // restore the tree based on array representation
      //var d_data = tree.decode(data.d);
      //return JSON.parse(d_data);
    }
  }
  return null;
}


function fieldRequestResponseToObject(raw_data)
{
  if (raw_data != null && raw_data.length > 2)
  {
    var tmp = raw_data.substring(0, raw_data.length - 2);
    return JSON.parse(tmp);
  }

  return null;
}



/*
 * accepted comd types:
 * - 'change-category-caption'
 * - 'change-expense-caption'
 * - 'change-category-projections'
 * - 'change-expense-projections-at-index'
 * - 'change-expense-current-projection'
 * - 'change-expense-amount'
 * - 'remove-expense'
 * - 'add-expense'
 */
function applyChange(target, changeCmd)
{
  if (target !== null && changeCmd !== null && changeCmd.type !== null)
  {
    switch (changeCmd.type)
    {
      case 'change-category-caption':
        if (changeCmd.category !== null && changeCmd.caption !== null)
        {
          var categoryObj = findCategory(changeCmd.category, target);
          if (categoryObj !== null && changeCmd.caption !== null)
          {
            categoryObj.caption = changeCmd.caption;
          }
        }
        break;
      case 'change-expense-caption':
        if (changeCmd.category !== null && changeCmd.id !== null && changeCmd.caption !== null)
        {
          var item = findItem(changeCmd.category, changeCmd.id), target;
          if (item !== null && item.caption !== null)
          {
            item.caption = changeCmd.caption;
          }
        }
        break;
      case 'change-category-projections':
        if (changeCmd.category !== null && changeCmd.monthlyProjection !== null && changeCmd.yearlyProjection !== null && changeCmd.index !== null)
        {
          var categoryObj = findCategory(changeCmd.category, target);
          if (categoryObj !== null && changeCmd.monthlyProjection !== null && changeCmd.yearlyProjection !== null)
          {
            categoryObj.monthlyProjection[Number(changeCmd.index)] = doubleDigitPrecision(Number(changeCmd.monthlyProjection));
            categoryObj.yearlyProjection[Number(changeCmd.index)] = doubleDigitPrecision(Number(changeCmd.yearlyProjection));
          }
        }
        break;
      case 'change-expense-projections-at-index':
        if (changeCmd.category !== null && changeCmd.id !== null && changeCmd.monthlyProjection !== null && changeCmd.yearlyProjection !== null && changeCmd.index !== null)
        {
          var item = findItem(changeCmd.category, changeCmd.id, target);
          if (item !== null && changeCmd.monthlyProjection !== null && changeCmd.yearlyProjection !== null)
          {
            item.monthlyProjection[Number(changeCmd.index)] = doubleDigitPrecision(Number(changeCmd.monthlyProjection));
            item.yearlyProjection[Number(changeCmd.index)] = doubleDigitPrecision(Number(changeCmd.yearlyProjection));
          }
        }
        break;
      case 'change-expense-current-projection':
        if (changeCmd.category !== null && changeCmd.id !== null && changeCmd.amount !== null && changeCmd.frequency !== null)
        {
          var item = findItem(changeCmd.category, changeCmd.id, target);
          if (item !== null && item.value !== null && item.frequency !== null)
          {
            item.value = doubleDigitPrecision(Number(changeCmd.amount));
            item.frequency = changeCmd.frequency;
          }
        }
        break;
      case 'change-expense-amount':
        if (changeCmd.category !== null && changeCmd.id !== null && changeCmd.amount !== null && changeCmd.index !== null)
        {
          var item = findItem(changeCmd.category, changeCmd.id, target);
          if (item !== null && item.monthlyTotals !== null)
          {
            item.monthlyTotals[changeCmd.index] = doubleDigitPrecision(Number(changeCmd.amount));
          }
        }
        break;
      case 'remove-expense':
        if (changeCmd.category !== null && changeCmd.id !== null )
        {
          var categoryObj = findCategory(changeCmd.category, target);
          if (categoryObj !== null && categoryObj.expenses !== null)
          {
            var i = 0;
            var found = false;
            for (i = 0; i < categoryObj.expenses.length; i++)
            {
              if (categoryObj.expenses[i] !== null && categoryObj.expenses[i].id !== null && categoryObj.expenses[i].id == changeCmd.id)
              {
                found = true;
                break;
              }
              i++;
            }
            if (found)
            {
              categoryObj.expenses.splice(i, 1);
            }
          }
        }
        break;
      case 'add-expense':
        if (changeCmd.category !== null && changeCmd.id !== null && changeCmd.caption)
        {
          var categoryObj = findCategory(changeCmd.category, target);
          if (categoryObj !== null && categoryObj.expenses !== null)
          {
            var newExpense = {
              "id": "",
              "caption": "",
              "frequency": "monthly",
              "value": 0,
              "monthlyProjection": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              "yearlyProjection": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              "monthlyTotals": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
            newExpense.id = changeCmd.id;
            newExpense.caption = changeCmd.caption;

            categoryObj.expenses.push(newExpense);
          }
        }
        break;

    }
  }
}


function getUTCCurrentMonth()
{
  var d = new Date();
  return d.getUTCMonth();
}

var current_displayed_month = getUTCCurrentMonth();



function percentageAsString(currentValue, maxValue)
{
  var result = Math.floor(currentValue * 100.0 / (maxValue < 1.0 ? 1.0 : maxValue));
  return result.toString() + '%';
}

/*
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
*/

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#FF';
    for (var i = 0; i < 4; i++ ) {
        color += letters[Math.floor(Math.random() * 10)];
    }

    return color;
}


function compareExpense(a, b)
{
  if (a.amount < b.amount)
    return 1;
  if (a.amount > b.amount)
    return -1;
  if (a.budgeted < b.budgeted)
    return 1;
  if (a.budgeted > b.budgeted)
    return -1;
  return 0
}


function updateMonthsCombo()
{
  var d = new Date();
  var currentYear = d.getUTCFullYear();
  var currentMonth = d.getUTCMonth();
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var html = `<option value="prevision">Budget Prevision</option>
              <option value="0" selected>Current month</option>
              <option value="1">Last month</option> `;

  for (var i = 0; i < number_of_displayed_months - 2; i++)
  {
    var index = currentMonth - 2 - i;
    index = index < 0 ? index + 12 : index;
    var caption = months[index] + ' ' + (index > currentMonth ? currentYear - 1 : currentYear).toString();
    html += '<option value="' + (2 + i).toString() + '">' + caption + '</option>';
    
  }
  $('#ui-board-select').html(html);
  
}

function tendencyChartData(category)
{
  var chartData = [];

  var d = new Date();
  var currentYear = d.getUTCFullYear();
  var currentMonth = d.getUTCMonth();
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  for (var i = 0; i < number_of_displayed_months; i++)
  {
    var index = currentMonth - i;
    index = index < 0 ? index + 12 : index;
    var caption = months[index] + ' ' + (index > currentMonth ? currentYear - 1 : currentYear).toString() + ' ';

    if (category == 'all')
    {
      var budgeted = 0.0;
      var amount = 0.0;
      var income = 0.0;
      for (var j = 0; j < user_data.categories.length; j++)
      {
        if (user_data.categories[j].category != 'income')
        {
          budgeted += user_data.categories[j].monthlyProjection[index];
          for (var k = 0; k < user_data.categories[j].expenses.length; k++)
          {
            amount += user_data.categories[j].expenses[k].monthlyTotals[index]; 
          }
        }
        else
        {
          for (var k = 0; k < user_data.categories[j].expenses.length; k++)
          {
            income += user_data.categories[j].expenses[k].monthlyTotals[index]; 
          }
        }
      }
      var p = percentageAsString(amount, budgeted);
      caption += '(' + p + ')';
      chartData.push({
          "caption": caption,
          "amount": amount,
          "budgeted": Math.floor(budgeted),
          "income" : Math.floor(income),
          "color" : "#ff2655",
          "dashLengthColumn": j != currentMonth ? 5 : 1,
          "alpha": j != currentMonth ? 0.5 : 0.8,
          "additional" : "   (i.e: " + p + " compared to prevision)"
      });
    }
    else
    {
      if (category != 'income')
      {
        var categoryObjects = user_data.categories.filter(function(item){return item.category == category; }); 
        var budgeted = categoryObjects[0].monthlyProjection[index];
        var amount = 0.0;
        for (var j = 0; j < categoryObjects[0].expenses.length; j++)
        {
          amount += categoryObjects[0].expenses[j].monthlyTotals[index]; 
        }
        var p = percentageAsString(amount, budgeted);
        caption += '(' + p + ')';
        chartData.push({
            "caption": caption,
            "amount": Math.floor(amount),
            "budgeted": Math.floor(budgeted),
            "color" : "#ff2655",
            "dashLengthColumn": j != currentMonth ? 5 : 1,
            "alpha": j != currentMonth ? 0.5 : 0.8,
            "additional" : "   (i.e: " + percentageAsString(income, budgeted) + " compared to prevision)"
        });
      }
      else 
      {
        var expense = 0.0;
        var income = 0.0;
        var budgetedExpense = 0.0;
        var budgetedIncome = 0.0;
        for (var j = 0; j < user_data.categories.length; j++)
        {
          for (var k = 0; k < user_data.categories[j].expenses.length; k++)
          { 
            if (user_data.categories[j].category != 'income')
            {
              budgetedExpense += user_data.categories[j].expenses[k].monthlyProjection[index];
              expense += user_data.categories[j].expenses[k].monthlyTotals[index];
            }
            else
            {
              budgetedIncome += user_data.categories[j].expenses[k].monthlyProjection[index];
              income += user_data.categories[j].expenses[k].monthlyTotals[index];
            }
          }
        }
        chartData.push({
            "caption": caption,
            "amount": Math.floor(expense),
            "budgeted": Math.floor(budgetedExpense),
            "income" : Math.floor(income),
            "budgetedIncome" : Math.floor(budgetedIncome),
            "color" : "#ff2655",
            "dashLengthColumn": j != currentMonth ? 5 : 1,
            "alpha": j != currentMonth ? 0.5 : 0.8
        });
      }
    }
  }

  return chartData;

}



function generateExpenseChartData(currentContext, category)
{
  var chartData = [];


  if (currentContext == 'prevision')
  {
    if (category == 'all')
    {
      for (var i = 0; i < user_data.categories.length; i++)
      {
        var amount = Math.floor(user_data.categories[i].monthlyProjection[getUTCCurrentMonth()]);
        var caption = user_data.categories[i].caption;
        if (amount > 0.1 && user_data.categories[i].category != 'income')
        {
          chartData.push({
              "caption": caption,
              "budgeted": amount,
              "color" : "#ff2655"
          });
        }
      }
    }
    else
    {
      if (category != 'income')
      {
        var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
        for (var i = 0; i < categoryObjects[0].expenses.length; i++)
        {
          var amount = Math.floor(categoryObjects[0].expenses[i].monthlyProjection[getUTCCurrentMonth()]);
            var caption = categoryObjects[0].expenses[i].caption;
            chartData.push({
                "caption" : caption,
                "budgeted": amount,
                "color" : "#ff2655"
            });
          
        }
      }
      else
      {
        var expense = 0.0;
        var income = 0.0;
        for (var i = 0; i < user_data.categories.length; i++)
        {
          for (var j = 0; j < user_data.categories[i].expenses.length; j++)
          { 
            if (user_data.categories[i].category != 'income')
            {
              expense += user_data.categories[i].expenses[j].monthlyProjection[getUTCCurrentMonth()];
            }
            else
            {
              income += user_data.categories[i].expenses[j].monthlyProjection[getUTCCurrentMonth()];
            }
          }
        }
        income = Math.floor(income);
        expense = Math.floor(expense);
        var balance = income - expense;
        chartData.push({
            "caption": "Income (+" + income.toString() + "$)",
            "budgeted": income,
            "color" : "#ff2655"
        });
        chartData.push({
            "caption": "Expense (-" + expense.toString() + "$)",
            "budgeted": -expense,
            "color" : "#ff2655"
        });
        chartData.push({
            "caption": "Balance (" + balance.toString() + "$)",
            "budgeted": balance,
            "color" : "#ff2655"
        });

      }
    }
  }
  else 
  {
    if (category == 'all')
    {
      for (var i = 0; i < user_data.categories.length; i++)
      {
        var amount = 0.0;
        var budgeted = user_data.categories[i].monthlyProjection[current_displayed_month];
        var caption = user_data.categories[i].caption;
        if (user_data.categories[i].category != 'income')
        {
          for (var j = 0; j < user_data.categories[i].expenses.length; j++)
          {
            amount += user_data.categories[i].expenses[j].monthlyTotals[current_displayed_month];
          }
          caption += " (" + percentageAsString(amount, budgeted) + ")";
          if (amount > 0.1 || budgeted > 0.1)
          {
            chartData.push({
                "caption": caption,
                "amount": Math.floor(amount),
                "budgeted": Math.floor(budgeted),
                "color" : "#ff2655"
            });
          }
        }
      }
    }
    else 
    {
      if (category != 'income')
      {
        var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
        for (var i = 0; i < categoryObjects[0].expenses.length; i++)
        {
          var amount = categoryObjects[0].expenses[i].monthlyTotals[current_displayed_month];
          var budgeted = categoryObjects[0].expenses[i].monthlyProjection[current_displayed_month];

          var caption = categoryObjects[0].expenses[i].caption;
          chartData.push({
              "caption": caption,
              "amount": Math.floor(amount),
              "budgeted": Math.floor(budgeted),
              "color" : "#ff2655"
          });     
        }
      }
      else 
      {
        var expense = 0.0;
        var income = 0.0;
        var budgetedExpense = 0.0;
        var budgetedIncome = 0.0;
        for (var i = 0; i < user_data.categories.length; i++)
        {
          for (var j = 0; j < user_data.categories[i].expenses.length; j++)
          { 
            if (user_data.categories[i].category != 'income')
            {
              budgetedExpense += user_data.categories[i].expenses[j].monthlyProjection[current_displayed_month];
              expense += user_data.categories[i].expenses[j].monthlyTotals[current_displayed_month];
            }
            else
            {
              budgetedIncome += user_data.categories[i].expenses[j].monthlyProjection[current_displayed_month];
              income += user_data.categories[i].expenses[j].monthlyTotals[current_displayed_month];
            }
          }
        }
        var balance = income - expense;
        chartData.push({
            "caption": "Income (+" + income.toString() + "$)",
            "amount": Math.floor(income),
            "budgeted": Math.floor(budgetedIncome),
            "color" : "#ff2655"
        });
        chartData.push({
            "caption": "Expense (-" + expense.toString() + "$)",
            "amount": Math.floor(-expense),
            "budgeted": Math.floor(-budgetedExpense),
            "color" : "#ff2655"
        });
        chartData.push({
            "caption": "Balance (" + balance.toString() + "$)",
            "amount": Math.floor(balance),
            "budgeted": Math.floor(budgetedIncome - budgetedExpense),
            "color" : "#ff2655"
        });
      }
    }
  }

  if (category != "income")
  {
    chartData.sort(compareExpense);
  }
  
  return chartData;
}

function generateBudgetedExpenseChartData() 
{
  var category = $('#current-context').text();
  var currentContext = document.getElementById("ui-board-select").value.toString();
  var result = generateExpenseChartData(currentContext, category);
  return result;
}

function generateTendencyChartData()
{
  var category = $('#current-context').text();
  return tendencyChartData(category);
}



function updateChartsHandler(evt)
{
  //expenseDonutChart.dataProvider = generateBudgetedExpenseChartData();
  //expenseDonutChart.validateData();

  tendencyBarChart.dataProvider = generateTendencyChartData();
  tendencyBarChart.validateData();

  balanceBarChart.dataProvider = generateBudgetedExpenseChartData();
  balanceBarChart.validateData();
}


function expenseMonthlyAmount(frequency, amount)
{
    switch(frequency)
    {
       case 'daily':
          return Math.floor(amount * 3000.0) / 100;
          break;
       case 'weekly':
          return Math.floor((amount / 7.0) * 3000.0) / 100;
          break;
       case 'monthly':
          return Math.floor(amount * 100) / 100;
          break;
       default:
          return Math.floor((amount / 12.0) * 100) / 100;
    }

}

function expenseYearlyAmount(frequency, amount)
{
    switch(frequency)
    {
       case 'daily':
          return Math.floor(amount * 36500.0) / 100;
          break;
       case 'weekly':
          return Math.floor((amount / 7.0) * 36500.0) / 100;
          break;
       case 'monthly':
          return Math.floor(amount * 1200.0) / 100;
          break;
       default:
          return Math.floor(amount * 100) / 100;
    }
}

function budgetedFrequencyUpdate(expenseId, category)
{
  var newFrequency = $('#ui-frequency-select' + expenseId.toString()).val();
  var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
  var expenseObjects = categoryObjects[0].expenses.filter(function(item) { return item.id == expenseId });
  expenseObjects[0].frequency = newFrequency;

  budgetedExpenseUpdate(expenseId, category, expenseObjects[0].value);
}


function expenseFrequencyCombo(frequency, expenseId, category)
{
    var html = '';

    html += '<select id="ui-frequency-select' + expenseId.toString() + '" onchange="budgetedFrequencyUpdate(\'' + expenseId + '\', \'' + category + '\')" class="ui-frequency-select">';
    html += '  <option value="daily"  '  + (frequency == 'daily' ? 'selected' : '') + '>Daily</option>';
    html += '  <option value="weekly"  '  + (frequency == 'weekly' ? 'selected' : '') + '>Weekly</option>';
    html += '  <option value="monthly"  '  + (frequency == 'monthly' ? 'selected' : '') + '>Monthly</option>';
    html += '  <option value="yearly"  '  + (frequency == 'yearly' ? 'selected' : '') + '>Yearly</option>';
    html += '</select>';

    return html;
}

function currentAmountModal(expenseId, category, isExpenseDialog)
{
  var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
  var expenseObjects = categoryObjects[0].expenses.filter(function(item) { return item.id == expenseId });

  $('#current-expense-id-for-dialog').text(expenseId);
  $('#current-category-for-dialog').text(category);
  
  if (isExpenseDialog)
  {
    $('#modal-dialog-input-amount').val('');
    $('#dialog-input-type').text('expenditure');
    $('#modal-dialog-input-label').text('Amount to add: ');
    $('#expense-entry-dialog-header').html('<button type="button" class="close" data-dismiss="modal">&times;</button>&nbsp;&nbsp;' + expenseObjects[0].caption + ' - current value: ' + expenseObjects[0].monthlyTotals[current_displayed_month].toString());
  }
  else
  {
    $('#modal-dialog-input-amount').val(expenseObjects[0].value);
    $('#dialog-input-type').text('budget');
    $('#modal-dialog-input-label').text('Budget Prevision: ');
    $('#expense-entry-dialog-header').html('<button type="button" class="close" data-dismiss="modal">&times;</button>&nbsp;&nbsp;' + expenseObjects[0].caption + ' - Budget Prevision: ');
  }
    

  // attempt to grab focus after the modal dialog poped up. 
  setTimeout(function(){ $('#modal-dialog-input-amount').focus(); }, 200);
  
}


function expenseProgress(percentage)
{
  var numericValue = Number(percentage.substring(0, percentage.length - 1));
  var progressbarType = 'progress-bar-info';
  if (numericValue > 60)
  {
    progressbarType = 'progress-bar-warning';
  }
  if (numericValue > 99)
  {
    progressbarType = 'progress-bar-danger';
  }

  var html = '<div class="progress">';
  html +='  <div class="progress-bar ' + progressbarType + '" role="progressbar" aria-valuenow="' + numericValue.toString() + '"';
  html +='  aria-valuemin="0" aria-valuemax="100" style="width:' + (numericValue > 100 ? 100 : numericValue).toString() +'%">';
  html +='    <span class="sr-only">' + percentage + '</span>';
  html +='  </div>';
  html +='</div>';

  return html;
}

function budgetInputUI(expenseId, category, amount) 
{
  if (typeof(amount) == "undefined")
    alert(expenseId + category);
  return '<div class="ui-expense-amount-hidden"> <a href="#" id="ui-expense-amount' + expenseId + '" data-toggle="modal" data-target="#expense-entry-dialog"  class="ui-fake-input" onclick="currentAmountModal(\'' + expenseId + '\', \'' + category + '\', false)"><div class="inner-fake-input">' + amount.toString() + '$</div></a></div>';
}

function expenseInputUI(expenseId, category, amount) 
{
  return '<div class="ui-current-amount"> <a href="#" id="ui-current-amount' + expenseId + '" data-toggle="modal" data-target="#expense-entry-dialog"  class="ui-fake-input" onclick="currentAmountModal(\'' + expenseId + '\', \'' + category + '\', true)"><div class="inner-fake-input">' + amount.toString() + '$</div></a></div>';
}



function categoryEntryHTML(category, caption)
{
  var html = '';

  html += '<li data-role="list-divider" class="'+ category +' category-' + category + '">' + caption + '</li>';
  html += '<li class="category-' + category + '"><hr></li>';
  html += '<li class="ui-expense-li category-' + category + ' ui-li-static ui-body-inherit">';
  html += '<div class="ui-expense-label-less-compact"></div>';
  html += '<div class="frequency-combo-container-hidden">';
  html += '</div><div class="ui-expense-amount-hidden"></div>';
  html += '<div class="ui-monthly-amount-hidden ' + category + '-monthly-total">0$</div>';
  html += '<div class="ui-yearly-amount-hidden ' + category + '-yearly-total">0$</div>';
  html += '<div class="ui-current-amount ' + category + '-current-total">0$</div>';
  html += '<div class="ui-current-percentage ' + category + '-current-percentage">0%</div>';
  html += '</li>';

  return html;
}

function expenseEntry(caption, frequency, budgetedAmount, expenseId, category)
{

    var html = '';

    html += '<li class="ui-expense-li category-' + category + '" id="' + expenseId + '">';
    html += '<div class="ui-expense-label-less-compact" id="ui-expense-label' + expenseId + '">' + caption + '</div>';
    html += '<div class="frequency-combo-container-hidden">'; 
    html += expenseFrequencyCombo(frequency, expenseId, category);
    html += '</div>';
    html += budgetInputUI(expenseId, category, budgetedAmount) ;
    html += '<div class="ui-monthly-amount-hidden '+ category +'-monthly-expense" id="ui-monthly-amount' + expenseId + '">'; 
    html += expenseMonthlyAmount(frequency, budgetedAmount)  + '$';
    html += '</div>';
    html += '<div class="ui-yearly-amount-hidden '+ category +'-yearly-expense" id="ui-yearly-amount' + expenseId + '">';  
    html += expenseYearlyAmount(frequency, budgetedAmount) + '$';
    html += '</div>';
    html += expenseInputUI(expenseId, category, 0)
    html += '<div class="ui-current-percentage" id="ui-current-percentage' + expenseId + '">';  
    html +=  expenseProgress('10%');
    html += '</div>';
    html += '</li>';

    $(html).insertAfter("." + category);

}


function updateTotalHandler(category)
{
  var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
  var monthlyValue = 0.0;
  var yearlyValue = 0.0;

  for (var i = 0; i < categoryObjects[0].expenses.length; i++)
  {
    monthlyValue += categoryObjects[0].expenses[i].monthlyProjection[current_displayed_month];
    yearlyValue += categoryObjects[0].expenses[i].yearlyProjection[current_displayed_month];
  }

  monthlyValue = (Math.floor(monthlyValue * 100.0)) / 100.0;
  yearlyValue = (Math.floor(yearlyValue * 100.0)) / 100.0;


  categoryObjects[0].monthlyProjection[current_displayed_month] = monthlyValue;
  categoryObjects[0].yearlyProjection[current_displayed_month] = yearlyValue;

  $('.' + category + '-monthly-total').text(monthlyValue.toString() + '$', null);
  $('.' + category + '-yearly-total').text(yearlyValue.toString() + '$', null);

}


function prepareCommit(changeCmd)
{
  if (pro_version)
  {
    change_cmd_pipe.push(changeCmd);
  }
}


function saveSessionAsNewUser()
{
  if (pro_version == false)
  {
    return;
  }

  var session = localStorage.getItem(app_id + ".logged-in-session");

  var credentials = localStorage.getItem(app_id + "." + session + ".credentials");
  var data = localStorage.getItem(app_id + "." + session + ".data");
  var fullid = localStorage.getItem(app_id + "." + session + ".fullid");

  var jqxhr = $.post(
    "http://sandbox.projectfurnace.org/new_user_request.php",
    { user : session, credentials : credentials, data : data, fullid : fullid }
  );

  jqxhr.done(
    function (d)
    {
      change_cmd_pipe.splice(0);

      localStorage.setItem(app_id + "." + session + ".cmd_pipe", encodeData([]));
      localStorage.setItem(app_id + "." + session + ".revision", "0");
      window.location.href = "login.html";
    }
  );

  change_cmd_pipe.splice(0);

  localStorage.setItem(app_id + "." + session + ".cmd_pipe", encodeData([]));
  localStorage.setItem(app_id + "." + session + ".revision", "0");
}

function refreshCurrentPage()
{

  synchronizeWithServer(
    function()
    {
      var selectedBoardLabel = $("#ui-board-select").val();
      if (selectedBoardLabel != null && selectedBoardLabel != "prevision")
      {
        fillSpreadsheetWithValuesForMonth(current_displayed_month);
      }
      updateChartsHandler(null);
    }
  );
}


function pushToServer(revision)
{
  commitChangeLocaly(false);

  var session = localStorage.getItem(app_id + ".logged-in-session");
  var data = localStorage.getItem(app_id + "." + session + ".data");

  var jqxhr = $.post(
    "http://sandbox.projectfurnace.org/commit.php",
    { email : session, data : data,  revision : Number(revision) }
  );

  jqxhr.done(
    function(d) 
    {
      // the push to the server was successful therefore we can save the new revision
      // and flush the command pipe
      localStorage.setItem(app_id + "." + session + ".revision", revision.toString());
      change_cmd_pipe.splice(0);
      localStorage.setItem(app_id + "." + session + ".cmd_pipe", encodeData([]));
    }
  );
}



function synchronizeWithServer(successCallbackFunc, failureCallbackFunc)
{
  var session = localStorage.getItem(app_id + ".logged-in-session");

  if (pro_version == false)
  {
    if (successCallbackFunc != null)
    {
      successCallbackFunc();
    }
    return;
  }

  $.ajaxSetup(
    {
      crossDomain: true,
      cache: false
    }
  );

  var jqxhr = $.post(
    "http://sandbox.projectfurnace.org/field_request.php",
    { user : session, field : "REV" }
  );

  jqxhr.fail(
    function()
    {
      $('.no-internet-connection').removeClass('ui-screen-hidden');

      if (failureCallbackFunc != null)
      {
        failureCallbackFunc();
      }
    }
  );

  jqxhr.done(
    function(d) 
    {
      $('.no-internet-connection').addClass('ui-screen-hidden');

      var rev = fieldRequestResponseToObject(d);
      if (rev == null || rev.REV == null)
      {
        saveSessionAsNewUser();
      }
      else
      {
        var revision = Number(localStorage.getItem(app_id + "." + session + ".revision"));
        if (revision != Number(rev.REV))
        {
          var last_raw_data_from_server = $.post(
            "http://sandbox.projectfurnace.org/field_request.php",
            { user : session, field : "JSONDATA,REV" }
          );

          last_raw_data_from_server.done(
            function (server_json_data)
            {
              var server_data = fieldRequestResponseToObject(server_json_data);
              if (server_data != null && server_data.JSONDATA != null)
              {
                user_data = decodeData(server_data.JSONDATA);

                if (change_cmd_pipe.length != 0)
                {
                  for (var i = 0; i < change_cmd_pipe.length; i++)
                  {
                    applyChange(user_data, change_cmd_pipe[i]);
                  }

                  pushToServer(Number(server_data.REV) + 1);
                  if (successCallbackFunc != null)
                  {
                    successCallbackFunc();
                  }
                }
                else
                {
                  localStorage.setItem(app_id + "." + session + ".revision", server_data.REV.toString());
                  commitChangeLocaly(false);
                  if (successCallbackFunc != null)
                  {
                    successCallbackFunc();
                  }
                }
              }
            }
          );
        }
        else if (change_cmd_pipe.length != 0)
        {
          pushToServer(revision + 1);
          if (successCallbackFunc != null)
          {
            successCallbackFunc();
          }
        }
        else
        {
          successCallbackFunc();
        }
      }
    }
  );
}


function commitChangeLocaly(bCheckPendingCmdsNumber) 
{
  var date = new Date();
  var currentMonth = date.getUTCMonth();
  user_data.lastCommit[0].year = date.getUTCFullYear();
  user_data.lastCommit[0].month = currentMonth;
  user_data.lastCommit[0].date = date.getUTCDate();
  user_data.lastCommit[0].hours = date.getUTCHours();
  user_data.lastCommit[0].minutes = date.getUTCMinutes();
  user_data.lastCommit[0].seconds = date.getUTCSeconds();

  var nextMonth = Number((date.getUTCMonth() + 1)) % 12;


  for (var i = 0; i < user_data.categories.length; i++)
  {
    var categoryObj = user_data.categories[i];
    categoryObj.monthlyProjection[nextMonth] = categoryObj.monthlyProjection[currentMonth];
    categoryObj.yearlyProjection[nextMonth] =  categoryObj.yearlyProjection[currentMonth];

    for (var j = 0; j < categoryObj.expenses.length; j++)
    {
      categoryObj.expenses[j].monthlyTotals[nextMonth] = 0.0;
      categoryObj.expenses[j].monthlyProjection[nextMonth] = categoryObj.expenses[j].monthlyProjection[currentMonth];
      categoryObj.expenses[j].yearlyProjection[nextMonth] = categoryObj.expenses[j].yearlyProjection[currentMonth];
    }
  }


  var raw_data = encodeData(user_data);

  var raw_change_cmds = encodeData(change_cmd_pipe);


  var session = localStorage.getItem(app_id + ".logged-in-session");
  localStorage.setItem(app_id + "." + session + ".data", raw_data);
  localStorage.setItem(app_id + "." + session + ".cmd_pipe", raw_change_cmds);

  // if PRO
  // if the amount of pending commands are piling up
  // and reaches a limit of 25, let's synchronize with server
  // in order to be able to flush those pending cmd
  if (bCheckPendingCmdsNumber)
  {
    if (change_cmd_pipe.length > 25)
    {
      refreshCurrentPage();
    }
  }

}




function fillSpreadsheetWithValuesForMonth(monthIndex)
{
  for (var i = 0; i < user_data.categories.length; i++)
  {
    var categoryId = user_data.categories[i].category;
    var monthlyProjectionForCategory = user_data.categories[i].monthlyProjection[monthIndex];
    var currentTotalExpenseForCategory = 0.0;
    for (var j = 0; j < user_data.categories[i].expenses.length; j++)
    {
      var expenseId = user_data.categories[i].expenses[j].id;
      var currentAmountForEntry = user_data.categories[i].expenses[j].monthlyTotals[monthIndex];
      if (expenseId != null && currentAmountForEntry != null)
      {
        var currentMonthlyProjectionForEntry = user_data.categories[i].expenses[j].monthlyProjection[monthIndex];
        currentTotalExpenseForCategory += currentAmountForEntry;

        $('#ui-current-amount' + expenseId).html('<div class="inner-fake-input">' + currentAmountForEntry.toString() + '$</div>');
        $('#ui-current-percentage' + expenseId).html(expenseProgress(percentageAsString(currentAmountForEntry, currentMonthlyProjectionForEntry))); 
      }
    }

    currentTotalExpenseForCategory = (Math.floor(currentTotalExpenseForCategory * 100.0) / 100.0);
    $('.' + categoryId + '-current-total').text(currentTotalExpenseForCategory.toString() + '$'); 
    $('.' + categoryId + '-current-percentage').html(expenseProgress(percentageAsString(currentTotalExpenseForCategory, monthlyProjectionForCategory))); 
  }
}


function budgetedExpenseUpdate(id, category, amount) 
{
    var expenseFrequencyComboId = 'ui-frequency-select' + id.toString();
    var expenseAmountId = 'ui-expense-amount' + id.toString();

    var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
    var expenseObjects = categoryObjects[0].expenses.filter(function(item) { return item.id == id });
    
    expenseObjects[0].value = amount;

    $('#ui-expense-amount' + id).html('<div class="inner-fake-input">' + amount.toString() + '$</div>');


    var monthlyValue = 0.0;
    var yearlyValue = 0.0;
    switch(expenseObjects[0].frequency)
    {
    case 'daily':
       monthlyValue = Math.floor(amount * 3000.0) / 100;
       yearlyValue = Math.floor(amount * 36500.0) / 100;
       break;
    case 'weekly':
       monthlyValue = Math.floor((amount / 7.0) * 3000.0) / 100;
       yearlyValue = Math.floor((amount / 7.0) * 36500.0) / 100;
       break;
    case 'monthly':
       monthlyValue = Math.floor(amount * 100) / 100;
       yearlyValue = Math.floor(amount * 1200.0) / 100;
       break;
    default:
       monthlyValue = Math.floor((amount / 12.0) * 100) / 100;
       yearlyValue = Math.floor(amount * 100) / 100;
    }

    expenseObjects[0].monthlyProjection[current_displayed_month] = monthlyValue;
    expenseObjects[0].yearlyProjection[current_displayed_month] = yearlyValue;


    $("#ui-monthly-amount" + id.toString()).html(monthlyValue.toString() + '$', null);            
    $("#ui-yearly-amount" + id.toString()).html(yearlyValue.toString() + '$', null);


    var changeCmd1 = { 
      type : 'change-expense-current-projection',  
      category : category , 
      id : id,
      amount : amount,
      frequency : expenseObjects[0].frequency
    }

    var changeCmd2 = { 
      type : 'change-expense-projections-at-index',  
      category : category , 
      id : id,
      monthlyProjection : monthlyValue,
      yearlyProjection : yearlyValue,
      index : current_displayed_month
    }


    updateTotalHandler(category);
    updateChartsHandler(null);


    prepareCommit(changeCmd1);
    prepareCommit(changeCmd2);

    commitChangeLocaly(true);

    

    //var time = new Date();
    //$('.container').triggerHandler('expense-update-event', [id, expenseFrequencyComboValue, amount, category, time]);
}

function updateCurrentCategoryTotals(category)
{
  
  var currentTotalForCategory = 0.0;

  var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
  for (var i = 0; i < categoryObjects[0].expenses.length; i++)
  {
    currentTotalForCategory += categoryObjects[0].expenses[i].monthlyTotals[current_displayed_month];
  }
  currentTotalForCategory = (Math.floor(currentTotalForCategory * 100.00)) / 100.0;

  $('.' + category + '-current-total').text(currentTotalForCategory.toString() + '$');
  $('.' + category + '-current-percentage').html(expenseProgress(percentageAsString(currentTotalForCategory, categoryObjects[0].monthlyProjection[current_displayed_month])));

}



function currentExpenseUpdate(id, category, amountToAdd) 
{
  var categoryObjects = user_data.categories.filter(function(item){return item.category == category; });
  var expenseObjects = categoryObjects[0].expenses.filter(function(item) { return item.id == id });
  var budgetedAmount = expenseObjects[0].monthlyProjection[current_displayed_month];
  var currentAmount = expenseObjects[0].monthlyTotals[current_displayed_month];
  expenseObjects[0].monthlyTotals[current_displayed_month] += amountToAdd;


  $('#ui-current-percentage' + id).html(expenseProgress(percentageAsString(expenseObjects[0].monthlyTotals[current_displayed_month], budgetedAmount)));
  $('#ui-current-amount' + id).html('<div class="inner-fake-input">' + expenseObjects[0].monthlyTotals[current_displayed_month].toString() + '$</div>');

  updateChartsHandler(null);

  updateCurrentCategoryTotals(category);

  var changeCmd = { 
    type : 'change-expense-amount',
    category : category,
    id : id,
    amount : expenseObjects[0].monthlyTotals[current_displayed_month],
    index : current_displayed_month
  };

  prepareCommit(changeCmd);

  commitChangeLocaly(true);

}


function boardSelectionChange()
{
  var selectedBoardLabel = $("#ui-board-select").val();
  if (selectedBoardLabel != "prevision")
  {
    $('.ui-expense-label').toggleClass('ui-expense-label ui-expense-label-less-compact');
    $('.frequency-combo-container').toggleClass('frequency-combo-container frequency-combo-container-hidden');
    $('.ui-expense-amount').toggleClass('ui-expense-amount ui-expense-amount-hidden');
    $('.ui-monthly-amount').toggleClass('ui-monthly-amount ui-monthly-amount-hidden');
    $('.ui-yearly-amount').toggleClass('ui-yearly-amount ui-yearly-amount-hidden');
    $('.ui-current-amount-hidden').toggleClass('ui-current-amount-hidden ui-current-amount');
    $('.ui-current-percentage-hidden').toggleClass('ui-current-percentage-hidden ui-current-percentage');

    current_displayed_month = (getUTCCurrentMonth() - Number(selectedBoardLabel));
    current_displayed_month = current_displayed_month < 0 ? current_displayed_month + 12 : current_displayed_month;

    fillSpreadsheetWithValuesForMonth(current_displayed_month);
  }
  else
  {
    $('.ui-expense-label-less-compact').toggleClass('ui-expense-label-less-compact ui-expense-label');
    $('.frequency-combo-container-hidden').toggleClass('frequency-combo-container-hidden frequency-combo-container');
    $('.ui-expense-amount-hidden').toggleClass('ui-expense-amount-hidden ui-expense-amount');
    $('.ui-monthly-amount-hidden').toggleClass('ui-monthly-amount-hidden ui-monthly-amount');
    $('.ui-yearly-amount-hidden').toggleClass('ui-yearly-amount-hidden ui-yearly-amount');
    $('.ui-current-amount').toggleClass('ui-current-amount ui-current-amount-hidden');
    $('.ui-current-percentage').toggleClass('ui-current-percentage ui-current-percentage-hidden');

    current_displayed_month = getUTCCurrentMonth();
  }

  updateChartsHandler(null);
}



function showCategory(category, isVisible)
{
  $("li.category-" + category).each(
    function (index) {
      switch (isVisible)
      {
        case true:
          $(this).removeClass('ui-screen-hidden');
          break;
        default:
          $(this).addClass('ui-screen-hidden');
          break;
      }
    }
  );
}

function revealCategoryOnly(category)
{
  var categories = ['housing', 'transportation','medical', 'utilities', 'personal', 'entertainment', 'household', 'giving', 'pets', 'insurance','taxes', 'debt', 'education', 'savings', 'income']; 

  $('#current-context').text(category);

  $.each(categories, 
    function(index, val) {
      showCategory(val, (val == category) || (category == 'all'));
    }
  );

}

function revealCategory() {
  var str = $(this).text().toLowerCase();
  if (str == 'all categories')
  {
    revealCategoryOnly('all');
  }
  else if (str == 'debt reduction')
  {
    revealCategoryOnly('debt');
  }
  else
  {
    revealCategoryOnly(str);
  }

  updateChartsHandler(null);
}


function fetchEntryFromDialog(event) 
{
  if ((event.type == 'click') || (event.type == 'keydown' && (event.which == 13 || event.which == 9)))
  {
    var expenseId = $("#current-expense-id-for-dialog").text();
    var category = $("#current-category-for-dialog").text();
    var inputType = $("#dialog-input-type").text();
    var amount = Number($("#modal-dialog-input-amount").val());

    switch (inputType)
    {
      case 'expenditure':
        currentExpenseUpdate(expenseId, category, amount);
        break;
      case 'budget':
        budgetedExpenseUpdate(expenseId, category, amount);
        break;
    }

    $('#expense-entry-dialog').modal('hide');
  }
}



function applyTheme()
{
  var session = localStorage.getItem(app_id + ".logged-in-session");
  if (session != null && typeof(session) != "undefined")
  {
    var theme = localStorage.getItem(app_id + "." + session + ".theme");
    if (theme != null && typeof(theme) != "undefined" && theme == "light")
    {
      dark_theme = false;
      $('link[href="css/SpryTabbedPanels.css"]').attr('href','css/SpryTabbedPanels-bright.css');
      $('link[href="css/style-dark.css"]').attr('href','css/style-bright.css');
    }
  }
}



function postStart()
{

  updateMonthsCombo();

  

  // verify if file format has changed. 
  if (user_data.hasOwnProperty('formatVersion') == false || typeof(user_data.formatVersion) == "undefined" || user_data.formatVersion != current_format_version)
  {
    // TODO implement change of version updater

    // If it is the case unfortunately for now, reload vanilla config and all past changes will be lost.
    alert('file corruption, all data are lost');
    user_data = JSON.parse(new_user_raw_data);
  }

  var expensesHTML = "";
  var incomeHTML = "";

  for (var i = 0; i < user_data.categories.length; i++)
  {
    var category = user_data.categories[i].category;
    var caption = user_data.categories[i].caption;

    $('#' + category + '-sidebar-entry').text(caption);

    if (category != 'income')
    {
      expensesHTML += categoryEntryHTML(category, caption);
    }
    else
    {
      incomeHTML += categoryEntryHTML(category, caption);
    }
  }
  $('.expenses-list').html(expensesHTML);
  $('.income-list').html(incomeHTML);


  for (var i = 0; i < user_data.categories.length; i++)
  {
    var category = user_data.categories[i].category;
    var m = user_data.categories[i].monthlyProjection[current_displayed_month];
    var y = user_data.categories[i].yearlyProjection[current_displayed_month];
    for (var j = 0; j < user_data.categories[i].expenses.length; j++)
    {
      var expense = user_data.categories[i].expenses[j];
      expenseEntry(expense.caption , expense.frequency, expense.value, expense.id, category);
    }
    $('.' + category + '-monthly-total').text(m.toString() + '$');
    $('.' + category + '-yearly-total').text(y.toString() + '$');
    
  }



  fillSpreadsheetWithValuesForMonth(getUTCCurrentMonth());


  //$( ".expenses-list" ).listview( "refresh" );
  //$( ".income-list" ).listview( "refresh" );

/*

    expenseDonutChart = AmCharts.makeChart( "expenses-donut", {
      "type": "pie",
      "theme": "dark",
      "titles": [ {
        "text": "Budgeted expenses",
        "size": 16
      } ],
      
      "valueField": "amount",
      "titleField": "caption",
      "startEffect": "elastic",
      "startDuration": 2,
      "labelRadius": 15,
      "innerRadius": "50%",
      "depth3D": 20,
      "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
      "angle": 40,
      "export": {
        "enabled": false
      }
    } );

*/

    balanceBarChart = AmCharts.makeChart("expenses-vs-prevision-barchart", {
          "theme": dark_theme ? "dark" : "light",
          "type": "serial",
          "valueAxes": [{
              "stackType": "3d",
              "unit": "$",
              "position": "left",
              "title": "Expense vs Prevision",
          }],
          "startDuration": 1,
          "graphs": [{
              "balloonText": "Expenses",
              "fillAlphas": 0.6,
              "lineAlpha": 0.2,
              "title": "Expenses",
              "type": "column",
              "valueField": "amount",
              "startEffect": "easyOutSine",
              "lineColor" : getRandomColor()
          }, {
              "balloonText": "Budgeted Prevision",
              "fillAlphas": 0.6,
              "lineAlpha": 0.2,
              "title": "Budgeted Prevision",
              "type": "column",
              "valueField": "budgeted",
              "startEffect": "easyOutSine",
              "lineColor" : getRandomColor()
          }
          ],
          "plotAreaFillAlphas": 0.1,
          "depth3D": 40,
          "angle": 30,
          "categoryField": "caption",
          "categoryAxis": {
              "gridPosition": "start",
              "labelRotation": 45
          },
          "export": {
            "enabled": false
           }
      });


      /*
      tendencyBarChart = AmCharts.makeChart("tendency-barchart", {
          "theme": "dark",
          "type": "serial",
          "valueAxes": [{
              "stackType": "3d",
              "unit": "$",
              "position": "left",
              "title": "Expense vs Prevision",
          }],
          "startDuration": 1,
          "graphs": [{
              "balloonText": "Expenses",
              "fillAlphas": 0.6,
              "lineAlpha": 0.2,
              "title": "Expenses",
              "type": "column",
              "valueField": "amount",
              "lineColor" : getRandomColor()
          }, {
              "balloonText": "Budgeted Prevision",
              "fillAlphas": 0.6,
              "lineAlpha": 0.2,
              "title": "Budgeted Prevision",
              "type": "column",
              "valueField": "budgeted",
              "lineColor" : getRandomColor()
          }],
          "plotAreaFillAlphas": 0.1,
          "depth3D": 60,
          "angle": 30,
          "categoryField": "caption",
          "categoryAxis": {
              "gridPosition": "start",
              "labelRotation": 45
          },
          "export": {
            "enabled": false
           }
      });
*/


      tendencyBarChart = AmCharts.makeChart( "tendency-barchart", {
        "type": "serial",
        "addClassNames": true,
        "theme": dark_theme ? "dark" : "light",
        "autoMargins": true,
        "marginLeft": 30,
        "marginRight": 8,
        "marginTop": 10,
        "marginBottom": 26,
        
        "balloon": {
          "adjustBorderColor": false,
          "horizontalPadding": 10,
          "verticalPadding": 8,
          "color": dark_theme ? "#FFFFFF" : "#000000"
        },

        "valueAxes": [ {
          "title": "Monthly Expenditure vs Prevision",
          "titleColor" : dark_theme ? "#FFFFFF" : "#000000",
          "axisAlpha": 0,
          "position": "left",
          "unit": "$",
          "color": dark_theme ? "#FFFFFF" : "#000000",
          "gridColor": dark_theme ? "#FFFFFF" : "#000000"

        } ],
        "startDuration": 0,
        "graphs": [ {
          "alphaField": "alpha",
          "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]$</span>",
          "fillAlphas": 1,
          "title": "Budgeted Prevision",
          "type": "column",
          "valueField": "budgeted",
          "startEffect": "easyOutSine",
          "dashLengthField": "dashLengthColumn",
        }, 
        {
          "id": "graph2",
          "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]$</span> [[additional]]</span>",
          "bullet": "square",
          "lineThickness": 3,
          "bulletSize": 7,
          "bulletBorderAlpha": 1,
          "bulletColor": dark_theme ? "#FFFFFF" : "#000000",
          "useLineColorForBulletBorder": true,
          "bulletBorderThickness": 3,
          "fillAlphas": 0,
          "lineAlpha": 1,
          "title": "Expenditure",
          "valueField": "amount",
          "startEffect": "easyOutSine",
          "dashLengthField": "dashLengthLine"
        },
        {
          "id": "graph3",
          "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]$",
          "bullet": "round",
          "lineThickness": 3,
          "bulletSize": 7,
          "bulletBorderAlpha": 1,
          "bulletColor": dark_theme ? "#FFFFFF" : "#000000",
          "useLineColorForBulletBorder": true,
          "bulletBorderThickness": 3,
          "fillAlphas": 0,
          "lineAlpha": 1,
          "title": "Income",
          "valueField": "income",
          "startEffect": "easyOutSine",
          "dashLengthField": "dashLengthLine"
        } ,
        {
          "id": "graph4",
          "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]$",
          "bullet": "round",
          "lineThickness": 3,
          "bulletSize": 7,
          "bulletBorderAlpha": 1,
          "bulletColor": dark_theme ? "#FFFFFF" : "#000000",
          "useLineColorForBulletBorder": true,
          "bulletBorderThickness": 3,
          "fillAlphas": 0,
          "lineAlpha": 1,
          "title": "Budgeted Income",
          "valueField": "budgetedIncome",
          "startEffect": "easyOutSine",
          "dashLengthField": "dashLengthLine"
        }  ],
        "categoryField": "caption",
        "categoryAxis": {
          "gridPosition": "start",
          "gridColor": dark_theme ? "#FFFFFF" : "#000000",
          "axisAlpha": 0,
          "tickLength": 0,
          "labelRotation": 45,
          "color": dark_theme ? "#FFFFFF" : "#000000",

        },
        "export": {
          "enabled": false
        }
      } );


      updateChartsHandler(null);



    

    $('#one').on('click', 
      function() { 
        switch($('#one').attr('data-cacheval'))
        {
          case 'true':
            $('#sidebar2')
              .addClass('charts-mobile-on')
              .removeClass('charts-mobile-off');
            break;
          default:
            $('#sidebar2')
              .addClass('charts-mobile-off')
              .removeClass('charts-mobile-on');
            break;
        }
        
      }
    );


    $("#a-income-sidebar-entry").on('click', revealCategory);
    $("#a-housing-sidebar-entry").on('click', revealCategory);
    $("#a-transportation-sidebar-entry").on('click', revealCategory);
    $("#a-medical-sidebar-entry").on('click', revealCategory);
    $("#a-utilities-sidebar-entry").on('click', revealCategory);
    $("#a-personal-sidebar-entry").on('click', revealCategory);
    $("#a-entertainment-sidebar-entry").on('click', revealCategory);
    $("#a-household-sidebar-entry").on('click', revealCategory);
    $("#a-giving-sidebar-entry").on('click', revealCategory);
    $("#a-pets-sidebar-entry").on('click', revealCategory);
    $("#a-insurance-sidebar-entry").on('click', revealCategory);
    $("#a-taxes-sidebar-entry").on('click', revealCategory);
    $("#a-debt-sidebar-entry").on('click', revealCategory);
    $("#a-education-sidebar-entry").on('click', revealCategory);
    $("#a-savings-sidebar-entry").on('click', revealCategory);
    $("#a-home-sidebar-entry").on('click', revealCategory);


    $("#validate-new-amount-modal-dialog-btn").unbind().click( fetchEntryFromDialog);
    $("#modal-dialog-input-amount").unbind().keydown( fetchEntryFromDialog);

    $("#tutorial-dialog").on('hidden.bs.modal', function () {
            $('#tutorial-dialog-content').html("");
    });



    var session = localStorage.getItem(app_id + ".logged-in-session");
    if (localStorage.getItem(app_id + "." + session + ".first-time") == "true")
    {
      localStorage.removeItem(app_id + "." + session + ".first-time");
      setTimeout( function() { launchTutorial(); }, 3000);
    }

    
}


function buddjetStart()
{
  applyTheme();

  var session = localStorage.getItem(app_id + ".logged-in-session");

  var raw_data = localStorage.getItem(app_id + "." + session + ".data");
  if (raw_data == null || typeof(raw_data) == "undefined" || raw_data.length < 100)
  {
    user_data = JSON.parse(new_user_raw_data);
  }
  else
  {
    user_data = decodeData(raw_data);
  }

  var cmd_pipe_raw = localStorage.getItem(app_id + "." + session + ".cmd_pipe");
  change_cmd_pipe = decodeData(cmd_pipe_raw);

  if (change_cmd_pipe == null)
  {
    change_cmd_pipe = [];
  }

  number_of_displayed_months = Number(localStorage.getItem(app_id + "." + session + ".history-length"));

  if (pro_version)
  {
    setInterval(refreshCurrentPage, 180000);
  }

  var title = sjcl.decrypt(app_id, localStorage.getItem(app_id + "." + session + ".fullid"));
  $('title').text("Welcome " + title);

  postStart();

}


