var rows;
var fields = 8;
var openFields = 3;
var zetels = Number(document.getElementById("aantalZetels").value);
var zetelsRekenGrens = 19;
var totalVotes;
var totalVast;
var kiesdeler;
var openFields = 3;
var gridContainer = document.getElementById("gridContainer");
var recalcBasePerc = document.getElementById("recalcBasePerc");
var herbereken = document.getElementById("herbereken");
var resetButton = document.getElementById("reset");
var clearButton = document.getElementById("clear");
var addButton = document.getElementById("add");
var removeButton = document.getElementById("remove");
var grid = new Array(rows);
var nextGrid = new Array(rows);
var allParties = [];
var total;
var initPartij = [['VVD', 2238351], ['PVV', 1372941], ['CDA', 1301796], ['D66', 1285819], ['GL', 959600], ['SP', 955633], ['PvdA', 599699], ['CU', 356271], ['PvdD', 335214], ['50PLUS', 327131], ['SGP', 218950], ['DENK', 216147], ['FvD', 187162], ['Overig', 161327]];
var header = ['Partij', 'Percentage', '# Stemmen', '# vaste zetels', '# rest zetels', '# totaal zetels', 'restzetels volgorde', 'vergelijking'];
var bottom = ['', '0', '0', '0', '0', '0', 'Kiesdeler =', ''];
var colWidth = [6, 8, 8, 5, 5, 5, 8, 8];

function Party(name, votes) {
  this.name =  name;
  this.perc = 0;
  this.votes = votes;
  this.seatsDirect = 0;
  this.seatsRest = 0;
  this.seatsTotal = 0;
  this.restSequence = "";
  this.average1Up = 0;
  
  this.getAttr = function(col) { 
    switch (col){
      case 0: return this.name;
      case 1: return this.perc;
      case 2: return this.votes;
      case 3: return this.seatsDirect;
      case 4: return this.seatsRest;
      case 5: return this.seatsTotal;
      case 6: return this.restSequence;
      case 7: return this.average1Up;
      default: return "";
    }
  }

  this.setName = function(name) { 
    this.name = name;
  }
  this.setPerc = function(perc) { 
    if (Number(perc) >= 0) {
      this.perc = Number(perc);
    }
  }
  this.setVotes = function(votes) { 
    if (Number(votes) >= 0) {
      this.votes = Number(votes);
    }
  }

  this.addToSequence = function(seq) { 
    if (this.restSequence === "") {
      this.restSequence += seq;
    } else {
      this.restSequence += ", " + seq;
    }
  }
}

// initialize
function initialize() {
    initParties();
    createTable();
    herbereken.onclick = herberekenButtonHandler;
    resetButton.onclick = resetButtonHandler;
    clearButton.onclick = clearButtonHandler;
    addButton.onclick = addButtonHandler;
    removeButton.onclick = removeButtonHandler;
}

function initParties() {
  allParties = [];
  for (var i = 0; i < initPartij.length; i++) {
    allParties.push(new Party(initPartij[i][0], initPartij[i][1]));
  }  
}

// lay out the board
function createTable() {
    if (!gridContainer) {
        // throw error
        console.error("Problem: no div for the grid table!");
    }
    var table = document.createElement("table");

    var thead = document.createElement("tr");
    for (var j = 0; j < fields; j++) {
      var cell = document.createElement("td");
      var cellText = document.createTextNode(header[j]);
      cell.appendChild(cellText);
      cell.setAttribute("size", colWidth[j]);
      thead.appendChild(cell);
    }
    table.appendChild(thead);

    table.appendChild(createInnerTable());
    
    var tfoot = document.createElement("tr");
    for (var j = 0; j < fields; j++) {
      var cell = document.createElement("td");
      var cellText = document.createTextNode(bottom[j]);
      cell.appendChild(cellText);
      cell.setAttribute("id", "total_" + j);
      tfoot.appendChild(cell);
    }
    table.appendChild(tfoot);

    gridContainer.appendChild(table);
}

function createInnerTable() {
    var tbody = document.createElement("tbody");
    tbody.id = "tbody";
    rows = allParties.length;
    for (var i = 0; i < rows; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < fields; j++) {
          var cell = document.createElement("td");
          var invoer = document.createElement("input");
          if (j < openFields) {
            invoer.setAttribute("type", "text");
            invoer.setAttribute("value", allParties[i].getAttr(j));
            invoer.setAttribute("id", i + "_" + j);
            invoer.setAttribute("size", colWidth[j]);
            cell.appendChild(invoer);
          } else if (j === fields - 1) {
            var cellText = document.createTextNode(numberR4(allParties[i].getAttr(j)));
            cell.appendChild(cellText);
            cell.setAttribute("id", i + "_" + j);
            cell.setAttribute("size", colWidth[j]);
          } else {
            var cellText = document.createTextNode(allParties[i].getAttr(j));
            cell.appendChild(cellText);
            cell.setAttribute("id", i + "_" + j);
            cell.setAttribute("size", colWidth[j]);
          }
          tr.appendChild(cell);
        }
        tbody.appendChild(tr);
    }
    return tbody;
}

function updateView(){
  for (i=0; i<rows; i++){
    for (var j = 0; j < fields; j++) {
      if (j < openFields) {
        var input = document.getElementById(i + "_" + j);
        input.setAttribute("value", allParties[i].getAttr(j));
      } else if (j === fields - 1) {
        var cell = document.getElementById(i + "_" + j);
        var oldText = document.getElementById(i + "_" + j).childNodes[0];
        var newText = document.createTextNode(numberR4(allParties[i].getAttr(j)));
        cell.replaceChild(newText, oldText);
      } else {
        var cell = document.getElementById(i + "_" + j);
        var oldText = document.getElementById(i + "_" + j).childNodes[0];
        var newText = document.createTextNode(allParties[i].getAttr(j));
        cell.replaceChild(newText, oldText);
      }
    }
  }
  updateTotals()
}  

function updateTotals(){
  total = [0, 0, 0, 0, 0,, 0];
  for (i=0; i<rows; i++){
    total[0] = addNumberR4(total[0], allParties[i].perc);
    total[1] = addNumberR4(total[1], allParties[i].votes);
    total[2] += Number(allParties[i].seatsDirect);
    total[3] += Number(allParties[i].seatsRest);
    total[4] += Number(allParties[i].seatsTotal);
  }
  total[5] =  'Kiesdeler = '; 
  total[6] =  numberR2(kiesdeler); 
  for (var j = 1; j < fields; j++) {
    if (j < fields) {
      var cell = document.getElementById("total_" + j);
      var oldText = document.getElementById("total_" + j).childNodes[0];
      var newText = document.createTextNode(total[j-1]);
      cell.replaceChild(newText, oldText);
    }
  }
}  

function herberekenButtonHandler() {
  console.log("Recalculate");
  zetels = Number(document.getElementById("aantalZetels").value);
  for (var i = 0; i < rows; i++) {
    var cell = document.getElementById(i + "_0");
    allParties[i].setName(cell.value);
    if (recalcBasePerc.checked === true) {
      cell = document.getElementById(i + "_1");
      allParties[i].setPerc(cell.value);
    } else {
      cell = document.getElementById(i + "_2");
      allParties[i].setVotes(cell.value);
    }
  }
  if (recalcBasePerc.checked === true) {
    console.log("Recalculate obv Perc");
    herberekenZetelsPerc();
  } else {
    console.log("Recalculate obv Votes");
    herberekenPerc()
    herberekenZetels();
  }
  updateView();
}

function herberekenPerc() {
  console.log("Herbereken percentages");
  totalVotes = 0; 
  for (i=0; i<rows; i++){
    totalVotes += allParties[i].votes;
  }
  for (i=0; i<rows; i++){
    allParties[i].setPerc(numberR4(100*allParties[i].votes/totalVotes));
  }
}

function renewInnerTable() {
  var oldTable = document.getElementById("tbody");
  var parentDiv = oldTable.parentNode;
  var newTable = createInnerTable();
  parentDiv.replaceChild(newTable, oldTable);
}

function resetButtonHandler() {
  console.log("Reset the table");
  initParties();
  renewInnerTable();
  kiesdeler = 0;
  updateTotals();
}

function clearButtonHandler() {
  console.log("Clear the table");
  allParties = [];
  allParties.push(new Party("...", 0));
  renewInnerTable();
  kiesdeler = 0;
  updateTotals();
}

function addButtonHandler() {
  console.log("Add");
  allParties.push(new Party("...", 0));
  renewInnerTable();
}

function removeButtonHandler() {
  console.log("Remove");
  for (var i = 0; i < rows; i++) {
    var cell = document.getElementById(i + "_0");
    if (cell.value === "") {
      allParties.splice(i,1);
    }
  }
  renewInnerTable();
}

function herberekenZetels() {
  console.log("Herbereken zetels");
  totalVotes = 0; 
  totalVast = 0; 
  for (i=0; i<rows; i++){
    totalVotes += allParties[i].votes;
    allParties[i].seatsDirect = 0;
    allParties[i].seatsRest = 0;
    allParties[i].seatsTotal = 0;
    allParties[i].restSequence = "";
  }
  kiesdeler = totalVotes/zetels; 
  console.log("Vaste zetels");
  for (i=0; i<rows; i++){
    if (allParties[i].name !== 'Overig') {
      var vasteZetels = Math.floor(allParties[i].votes/kiesdeler);
      allParties[i].seatsDirect = vasteZetels;
      allParties[i].seatsTotal = allParties[i].seatsDirect + allParties[i].seatsRest;
      if (zetels < zetelsRekenGrens) {    
        allParties[i].average1Up = allParties[i].votes - allParties[i].seatsDirect * kiesdeler;  // haal de volle zetels van de stemmen af, de rest is voor de vergelijking 
      } else {
        allParties[i].average1Up = allParties[i].votes/(allParties[i].seatsTotal + 1);  // tel 1 zetel bij en neem het gemiddelde voor de vergelijking 
      }
      totalVast += vasteZetels;
    }
  }  
  if (zetels < zetelsRekenGrens) {    
    herberekenRestZetelsKlein();
  } else {
    herberekenRestZetels();
  }
}  

function herberekenRestZetels() {
  console.log("Rest zetels");
  for (r=0; r<(zetels - totalVast); r++){
    var partyHigh1Up;
    var partyHigh1UpFound = false;
    for (i=0; i<rows; i++){
      if (allParties[i].name !== 'Overig' && allParties[i].votes >= kiesdeler) {
        if (partyHigh1UpFound === false) {
          partyHigh1Up = i;
          partyHigh1UpFound = true;
        } else if (   allParties[partyHigh1Up].average1Up < allParties[i].average1Up 
                   || (   allParties[partyHigh1Up].average1Up === allParties[i].average1Up 
                       && allParties[partyHigh1Up].votes < allParties[i].votes)) {
          partyHigh1Up = i;
        } 
      }
    }
    allParties[partyHigh1Up].seatsRest += 1;
    allParties[partyHigh1Up].seatsTotal = allParties[partyHigh1Up].seatsDirect + allParties[partyHigh1Up].seatsRest;
    allParties[partyHigh1Up].addToSequence(r + 1);
    allParties[partyHigh1Up].average1Up = allParties[partyHigh1Up].votes/(allParties[partyHigh1Up].seatsTotal + 1);
  }
}

function herberekenRestZetelsKlein() {
  console.log("Rest zetels");
  for (r=0; r<(zetels - totalVast); r++){
    var partyHigh1Up;
    var partyHigh1UpFound = false;
    for (i=0; i<rows; i++){
      if (allParties[i].name !== 'Overig' && allParties[i].votes >= 0.75*kiesdeler && allParties[i].seatsRest === 0) {
        if (partyHigh1UpFound === false) {
          partyHigh1Up = i;
          partyHigh1UpFound = true;
        } else if (allParties[partyHigh1Up].average1Up < allParties[i].average1Up) {
          partyHigh1Up = i;
        } 
      }
    }
    allParties[partyHigh1Up].seatsRest += 1;
    allParties[partyHigh1Up].seatsTotal = allParties[partyHigh1Up].seatsDirect + allParties[partyHigh1Up].seatsRest;
    allParties[partyHigh1Up].addToSequence(r + 1);
  }
}

function herberekenZetelsPerc() {
  console.log("Herbereken zetels obv Perc");
  totalPerc = 0; 
  totalVast = 0; 
  for (i=0; i<rows; i++){
    totalPerc += allParties[i].perc;
    allParties[i].seatsDirect = 0;
    allParties[i].seatsRest = 0;
    allParties[i].seatsTotal = 0;
    allParties[i].restSequence = "";
  }
  console.log("Herbereken zetels obv Perc " + totalPerc);
  kiesdeler = totalPerc/zetels; 
  console.log("Vaste zetels");
  for (i=0; i<rows; i++){
    if (allParties[i].name !== 'Overig') {
      var vasteZetels = Math.floor(allParties[i].perc/kiesdeler);
      allParties[i].seatsDirect = vasteZetels;
      allParties[i].seatsTotal = allParties[i].seatsDirect + allParties[i].seatsRest;
      allParties[i].average1Up = allParties[i].perc/(allParties[i].seatsTotal + 1);  // tel 1 zetel bij en vergelijk dan de gemiddelden 
      totalVast += vasteZetels;
    }
  }
  
  console.log("Rest zetels");
  for (r=0; r<(zetels - totalVast); r++){
    var partyHigh1Up;
    var partyHigh1UpFound = false;
    for (i=0; i<rows; i++){
      if (allParties[i].name !== 'Overig' && allParties[i].perc >= kiesdeler) {
        if (partyHigh1UpFound === false) {
          partyHigh1Up = i;
          partyHigh1UpFound = true;
        } else if (   allParties[partyHigh1Up].average1Up < allParties[i].average1Up 
                   || (   allParties[partyHigh1Up].average1Up === allParties[i].average1Up 
                       && allParties[partyHigh1Up].perc < allParties[i].perc)) {
          partyHigh1Up = i;
        } 
      }
    }
    allParties[partyHigh1Up].seatsRest += 1;
    allParties[partyHigh1Up].seatsTotal = allParties[partyHigh1Up].seatsDirect + allParties[partyHigh1Up].seatsRest;
    allParties[partyHigh1Up].addToSequence(r + 1);
    allParties[partyHigh1Up].average1Up = allParties[partyHigh1Up].perc/(allParties[partyHigh1Up].seatsTotal + 1);
  }

}

function numberR2(num) {
  return Math.round(100*Number(num))/100;
}

function numberR4(num) {
  return Math.round(10000*Number(num))/10000;
}

function addNumberR4(num1, num2) {
  return Math.round(10000*(Number(num1) + Number(num2)))/10000;
}

// start everything

window.onload = initialize;