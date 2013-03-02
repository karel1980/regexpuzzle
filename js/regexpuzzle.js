$(function() {

/*

The three directions are are labeled A, B and C
A left-to-right (ltr)
B top-right to bottom left
C bottom-right to top-left

*/

  var HexPanels = function(cellList) {
    this.rows = [];
    // get the top, bottom, left and right cells:
    var top = 0;
    var bottom = 0;
    var left = 0;
    var right = 0;

    for (var i in cellList) {
      var cell = cellList[i];
      if (cell.row < top) top = cell.row;
      if (cell.row > bottom) bottom = cell.row;
      if (cell.col < left) left = cell.col;
      if (cell.col > right) right = cell.col;
    }

    // Initialize the array from top-left to bottom-right
    for (var i = top; i <= bottom; i++) {
      var row = [];
      this.rows.push(row);
      for (var j = left; j <= right; j++) {
        row.push(undefined); 
      }
    }
   
    // populate the cells
    for (var i in cellList) {
      var cell = cellList[i];
      this.rows[cell.row][cell.col] = cell;
    }

  }

  var Puzzle = function(puzzledef) {
    this.puzzledef = puzzledef;
    this.initExpressions();
    this.initCells();
    this.hexPanels = new HexPanels(this.cells);
  }

  Puzzle.prototype.initExpressions = function() {
    this.expressions = [];
    for (var i = 0; i < this.puzzledef.expressions.length; i++) {
      var e = this.puzzledef.expressions[i];
      var row = e[0];
      var col = e[1];
      var dir = e[2];
      var length = e[3];
      var pattern = e[4];

      var rowDir = 0;
      var colDir = 0;
      if (dir == "A") {
        colDir = 1; 
      } else if (dir == "B") {
        rowDir = 1;
      } else if (dir == "C") {
        rowDir = -1;
        colDir = -1;
      }
      this.expressions.push({
        row: row,
        col: col,
        dir: dir,
        rowDir: rowDir,
        colDir: colDir,
        length: length,
        pattern: pattern
      });
    }

    // normalize the expressions so rows and colls are strictly non-negative, and have a zero origin
    this.minRow = 0;
    this.minCol = 0;

    for (var i = 0; i < this.expressions.length; i++) {
      var e = this.expressions[i];
      for (var j = 0; j < e.length; j++) {
        var row = e.row + e.rowDir * j;
        var col = e.col + e.colDir * j;
        if (row < this.minRow) this.minRow = row;
        if (col < this.minCol) this.minCol = col;
      }
    }
  }

  Puzzle.prototype.initCells = function() {

    this.cells = {};
    for (var i = 0; i < this.expressions.length; i++) {
      var e = this.expressions[i];
      e.row -= this.minRow;
      e.col -= this.minCol;
      for (var j = 0; j < e.length; j++) {
        var row = e.row + e.rowDir * j;
        var col = e.col + e.colDir * j;
        key = "" + row + "_" + col;
        console.log("%s -- %s", key, e.pattern)
        this.cells[key] = { row: row, col: col };
      }
    }

  }

  var TableView = function($table, puzzle) {
    this.$table = $table;
    this.puzzle = puzzle;
    this.initDimensions();
    this.initTable();
  }

  TableView.prototype.initDimensions = function() {
    // calculate leftmost cell for every row, use it's column as an offset so columns will be strictly non-negative
    this.leftMostByRow = {};
    this.leftMost = 999;

    for (i in puzzle.hexPanels.rows) {
      var row = puzzle.hexPanels.rows[i];
      for (j in row) {
        var cell = row[j];
        if (cell === undefined) { continue; }
        var tCol = cell.row * 2 - cell.col;
        
        if (this.leftMostByRow[cell.row] === undefined || tCol < this.leftMostByRow[cell.row] ) {
          this.leftMostByRow[cell.row] = tCol;
        }

        if (tCol < this.leftMost) this.leftMost = tCol;
      }
    }

  }

  TableView.prototype.initTable = function() {
    // extra row for the labels
    // TODO: add cells
    var $row = $("<tr/>");
    this.$table.append($row);

    // tmeporary fix: create cells for the first row (which only contains labels)
    for (var i = 0; i < 29; i++) {
      $row.append($("<td>"));
    }

    for (var i in this.puzzle.hexPanels.rows) {
      var row = this.puzzle.hexPanels.rows[i];
      $row = $("<tr/>");

      // temporary fix: the table width is too low, so add a couple of extra cells
      $cell = $("<td></td>");
      $row.append($cell);
      for (var j in row) {
        $cell = $("<td></td>");
        $row.append($cell);
        $cell = $("<td></td>");
        $row.append($cell);
      }
      $cell = $("<td></td>");
      $row.append($cell);
      $cell = $("<td></td>");
      $row.append($cell);
      $cell = $("<td></td>");
      $row.append($cell);
      this.$table.append($row);
    }

    $row = $("<tr/>");
    this.$table.append($row);
    for (var i = 0; i < 29; i++) {
      $row.append($("<td>"));
    }

    // create inputs
    for (var i in this.puzzle.hexPanels.rows) {
      var row = this.puzzle.hexPanels.rows[i];
      for (var j in row) {
        var cell = row[j];
        if (cell != undefined) {
          var $cell = this.cellToTableCell(cell.row, cell.col);
          //$cell.text("" + cell.row + "," + cell.col + "//" + coords[0] + "," + coords[1]);
          var $input = $("<input type=\"text\"/>");
          var view = this;
          $input.keyup(function() {
            view.update();
          });
          $cell.append($input);
        }
      }
    }

    // create labels
    for (var i in this.puzzle.expressions) {
      var e = this.puzzle.expressions[i];

      $labelCell = this.labelCell(e);
      var $firstCell = this.cellToTableCell(e.row, e.col);
      var pos = $firstCell.position();
      var $span = $("<span/>");
      $span.text(e.pattern);
      $span.addClass("label");
      $span.addClass("label" + e.dir);
      $span.css("position", "absolute");
      $labelCell.append($span);
      if (e.dir == "A") {
        $span.css("top", pos.top + ($firstCell.height() - $span.height()) / 2);
        $span.css("left", pos.left - $span.width() - 10);
      } else if (e.dir == "B") {
        $span.css("top", pos.top - $span.height() / 2);
        $span.css("left", pos.left + $firstCell.width() - $span.width());
      } else if (e.dir =="C") {
        $span.css("top", pos.top + $firstCell.height() - $span.height() / 2);
        $span.css("left", pos.left + $firstCell.width() - $span.width());
      }
    }
  }

  TableView.prototype.labelCell = function(e) {
    return this.cellToTableCell(e.row - e.rowDir, e.col - e.colDir);
  }

  TableView.prototype.update = function() {
    for (var i in this.puzzle.expressions) {
      var e = this.puzzle.expressions[i];
      var text = this.getText(e);

      $labelCell = this.labelCell(e);
      if (text.match(e.pattern)) {
        $labelCell.find("span").addClass("correct");
      } else {
        $labelCell.find("span").removeClass("correct");
      }
    }

    // update fragId
    var state = "";
    var firstRow = true;
    for (var i in this.puzzle.hexPanels.rows) {
      var row = this.puzzle.hexPanels.rows[i];
      if (!firstRow) {
        state += ";";
      }
      firstRow = false;
      var firstCell = true;
      for (var j in row) {
        var cell = row[j];
        if (cell == undefined) {
          continue;
        }
        if (!firstCell) {
          state += ",";
        }
        firstCell = false;
        state+=this.cellToTableCell(cell.row, cell.col).find("input").val();
      }
    }
    window.location.hash=state;
  }

  TableView.prototype.getText = function(e) {
    result = "";
    for (var j = 0; j < e.length; j++) {
      $cell = this.cellToTableCell(e.row + j*e.rowDir, e.col + j*e.colDir);
      var cellVal = $cell.find("input").val();
      if (cellVal == "") cellVal = " ";
      result += cellVal;
    }
    return result;
  }

  TableView.prototype.cellToTableCell = function(r, c) {
    var coords = this.getCellCoordinates(r, c);
    var $row = $(this.$table.find("tr").get(coords[0]))
    return $($row.find("td").get(coords[1]));
  }

  TableView.prototype.getCellCoordinates = function(r, c) {
    var tr = r + 1;
    var tc = 2 * c + 2 - r - this.leftMost;
    return [ tr, tc ];
  }

  TableView.prototype.loadFragId = function() {
    var fragId = window.location.hash;
    if (fragId.length == 0) {
      return;
    } else {
      fragId = fragId.substring(1);
    }
    var rows = fragId.split(";");
    for (var i in this.puzzle.hexPanels.rows) {
      var row = this.puzzle.hexPanels.rows[i];
      var cols = rows[i].split(",");
      var col = 0;
      for (var j in row) {
        var cell = row[j];
        if (cell == undefined) {
          continue;
        }
        var val = cols[col];
        this.cellToTableCell(cell.row, cell.col).find("input").val(val);
        col++;
      }
    }
  }

  var $table = $("#puzzletable");
  var puzzle = new Puzzle(puzzledef);
  var tableView = new TableView($table, puzzle);
  tableView.loadFragId();
  tableView.update();

});
