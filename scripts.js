
// глобальные переменные

var windowsHeight = window.innerHeight;
var windowsWidth = window.innerWidth;

var infoGames = {};
var fieldGames = {};

// После загрузки документа
dojo.addOnLoad(function(){

	//создать игровое меню
	createMenuGames();
});

// создание игрового меню
function createMenuGames(){

	// создание элементов
	var menuGames = document.createElement("DIV");
	var buttonWithAI = document.createElement("INPUT");
	var namePlayer = document.createElement("INPUT");
	var groupCheckedNouths = document.createElement("label");
	var groupCheckedCroses = document.createElement("label");
	

	// вставка элементов на страницу
	document.body.appendChild(menuGames);
	
	menuGames.appendChild(namePlayer);
	menuGames.appendChild(groupCheckedNouths);
	menuGames.appendChild(groupCheckedCroses);
	menuGames.appendChild(buttonWithAI);
	
	// присвоение атрибутов и классов

	menuGames.setAttribute("id", "menuGames");
	menuGames.style.position = "absolute";
	menuGames.style.left = (windowsWidth - 300 - 30)/2 + "px";
	menuGames.style.top = (windowsHeight - menuGames.offsetHeight)/2 + "px";
	
	namePlayer.setAttribute("type", "text");
	namePlayer.setAttribute("class", "inputTextMenuGames");
	
	buttonWithAI.setAttribute("type", "button");
	buttonWithAI.setAttribute("class", "inputButtonMenuGames");
	buttonWithAI.value = "Играть с AI";
	
	groupCheckedNouths.setAttribute("class", "checkedIcons");
	groupCheckedNouths.style.color = "#FFF";
	groupCheckedCroses.setAttribute("class", "checkedIcons");
	groupCheckedCroses.style.color = "#FFF";
	
	groupCheckedCroses.innerHTML = '<INPUT type = "radio" name = "choseIc" id = "checkedCroses" checked> Крестики';
	groupCheckedNouths.innerHTML = '<INPUT type = "radio" name = "choseIc" id = "checkedNouths" > Нолики';
	
	// определение событий
	
	var clickButtonWithAI = dojo.connect(
			buttonWithAI,
			"onclick",
			null,
			function(){
				groupCheckedNouths.style.display = "block";
				groupCheckedCroses.style.display = "block";
				namePlayer.style.display = "block";
				
				clickButtonWithAI = dojo.connect(
						buttonWithAI,
						"onclick",
						null,
						function(){
							var nameGamer;
							var typeGamer;
							
							dojo.disconnect(clickButtonWithAI);
							
							if (dojo.byId("checkedNouths").checked){
								typeGamer = 0;
							} else {
								typeGamer = 1;
							}
							
							if (namePlayer.value != "" && namePlayer.value.length < 20){
								nameGamer = namePlayer.value;
							} else {
								if (!typeGamer){
									nameGamer = "Игорок за Нолики";
								} else {
									nameGamer = "Игрок за Крестики";
								}
							}
							
							document.body.removeChild(menuGames);
							createGameWithAI(nameGamer, typeGamer);
						});
			});
}

// инициилизация игры с компьютером

function createGameWithAI(namePlayer, typePlayer){
	if (typePlayer === 0){
		formingInfoBar({1: namePlayer, 2: "Крестики под управлением AI"});
		infoGames.player1.AI = false; 
	} else {
		formingInfoBar({1: "Нолики под управлением AI", 2: namePlayer});
		infoGames.player1.AI = true;
	}
		
	// создать игровое поле
	createFieldGames();
	
	choiceOfActionGameWithAI();
};

// формирование информационной панели, на которой 
// отображается текущие состояние игры

function formingInfoBar(names){
	var barTable = document.createElement("table");
	document.body.appendChild(barTable);
	barTable.style.width = windowsWidth - 15 + "px";
	barTable.style.height = "50px";
	barTable.style.backgroundColor = "#33F";
	barTable.style.color = "#FFF";
	barTable.style.fontWeight = "bold";
	barTable.style.borderRadius = "0 0 15px 15px";
	barTable.style.borderCollapse = "collapse";
	
	var firstRow = document.createElement("tr");
	barTable.appendChild(firstRow);

	var dFirstPlayer = document.createElement("td");
	firstRow.appendChild(dFirstPlayer);
	dFirstPlayer.style.width = barTable.offsetWidth/7*2;
	dFirstPlayer.style.borderBottom = "1px solid #AAA";
	dFirstPlayer.setAttribute("class", "barTableCenter");
	dFirstPlayer.innerHTML = names[1];

	var dFirstScopePlayers = document.createElement("td");
	firstRow.appendChild(dFirstScopePlayers);
	dFirstScopePlayers.style.width = barTable.offsetWidth/7*1;
	dFirstScopePlayers.style.borderBottom = "1px solid #AAA";
	dFirstScopePlayers.setAttribute("class", "barTableLeft");
	dFirstScopePlayers.innerHTML = "2";

	var dScopeGames = document.createElement("td");
	firstRow.appendChild(dScopeGames);
	dScopeGames.style.width = barTable.offsetWidth/7*1 - 10;
	dScopeGames.style.fontSize = "26pt";
	dScopeGames.style.borderLeft = "5px solid #AAA";
	dScopeGames.style.borderRight = "5px solid #AAA";
	dScopeGames.setAttribute("class", "barTableCenter");
	dScopeGames.setAttribute("rowspan", "2");
	dScopeGames.innerHTML = "5";
	
	var dStatusGames = document.createElement("td");
	firstRow.appendChild(dStatusGames);
	dStatusGames.style.fontSize = "16pt";
	dStatusGames.setAttribute("class", "barTableCenter");
	dStatusGames.setAttribute("rowspan", "2");
	dStatusGames.innerHTML = "Ходят нолики";

	var secondRow = document.createElement("tr");
	barTable.appendChild(secondRow);
	
	var dSecondPlayer = document.createElement("td");
	secondRow.appendChild(dSecondPlayer);
	dSecondPlayer.setAttribute("class", "barTableCenter");
	dSecondPlayer.innerHTML = names[2];

	var dSecondScopePlayers = document.createElement("td");
	secondRow.appendChild(dSecondScopePlayers);
	dSecondScopePlayers.setAttribute("class", "barTableLeft");
	dSecondScopePlayers.innerHTML = "56";

	infoGames = {
		player1: {
			nameP: names[1],
			score: 0
		},

		player2: {
			nameP: names[2],
			score: 0
		},

		numberOfGames: 0,
		
		// состояние игры
		// 0 - ходят "нолики"
		// 1 - ходят "крестики"
		// 2 - конец раунда, победа "ноликов". Следующий ход ноликов.
		// 3 - конец раунда, победа "крестиков". Следующий ход ноликов.
		// 4 - конец раунда, ничья. Следующий ход ноликов.
		// 5 - конец игры. Вывод счета. Проверяется первым. 
		statusGames: 0,

		// ссылки на ячейки для обновления информации
		dScorePlayers1: dFirstScopePlayers,
		dScorePlayers2: dSecondScopePlayers,
		dScoreGames: dScopeGames,
		dStatusGames: dStatusGames,

		updateInfoBar: function(){
			this.dScorePlayers1.innerHTML = this.player1.score;
			this.dScorePlayers2.innerHTML = this.player2.score;
			this.dScoreGames.innerHTML = this.numberOfGames;
			
			switch(this.statusGames){
				case 0:
					 this.dStatusGames.innerHTML = "Ходит - " + this.player1.nameP;
				break;
				case 1:
					 this.dStatusGames.innerHTML = "Ходит - " + this.player2.nameP;
				break;
				case 2: 
					 this.dStatusGames.innerHTML = "Конец раунда, победил - " + this.player1.nameP;																								this.player1.nameP;
				break;
				case 3:
					 this.dStatusGames.innerHTML = "Конец раунда, победил - " + this.player2.nameP;																				this.player1.nameP;
				break;
				case 4:
					this.dStatusGames.innerHTML = "Конец раунда, ничья!";
				break;
				case 5:
					if (this.player1.score >= this.player2.score){
						if (this.player1.score == this.player2.score){
							this.dStatusGames.innerHTML = "Конец игры, ничья!";					
						} else {
							this.dStatusGames.innerHTML = "Конец игры, победил - " + this.player1.nameP;
						};				
					} else {
						this.dStatusGames.innerHTML = "Конец игры, победил - " + this.player2.nameP;
					};
				break;
			};				
		},
	};
	
	infoGames.updateInfoBar();
};

function createFieldGames(){
	var field = document.createElement("canvas");
	var sizeCell = 30;
	var rows;
	var couls;
	var ctx = field.getContext("2d");
	
	document.body.appendChild(field);
	field.style.display = "block";
	
	
	
	field.style.position = "absolute";
	field.style.borderTop = "0px";
	field.style.backgroundColor = "#FF9";
	couls = Math.floor((windowsWidth - 30 - 10 - 15)/sizeCell);
	if (couls < 5) couls = 5;
	field.setAttribute("width", (couls * sizeCell));
	var leftNumber = Math.floor((windowsWidth - 55 - couls * sizeCell)/2 + 15);
	field.style.left = leftNumber + "px";
	rows = Math.floor((windowsHeight - 70)/sizeCell);
	if (rows < 5) rows = 5;
	field.setAttribute("height", (rows * sizeCell));
	field.style.top = 50 + "px";
	field.style.borderBottom = "5px solid #33F";
	field.style.borderLeft = "5px solid #33F";
	field.style.borderRight = "5px solid #33F";
	
	fieldGames.cells = new Array(rows);
		
	for(var i = 0; i < rows; i++){
		fieldGames.cells[i] = new Array(couls);
		
		for(var j = 0; j < couls; j++){
			fieldGames.cells[i][j] = 0;
		};
	};
	
	ctx = field.getContext("2d");
	ctx.beginPath();
	
	for (var k = 1; k < (rows); k++){
			ctx.moveTo(0, (k * sizeCell));
			ctx.lineTo((couls * sizeCell), (k * sizeCell));
	};
	
	for (var p = 1; p < (couls); p++){
		ctx.moveTo((p * sizeCell), 0);
		ctx.lineTo((p * sizeCell), couls * sizeCell);
	};

	ctx.closePath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#000";
	ctx.stroke();
	
	fieldGames.ctx = ctx;
	fieldGames.refers = field;
	fieldGames.tabTop = 50;
	fieldGames.tabLeft = leftNumber + 5;
	fieldGames.sizeCell = sizeCell;
	
	
	//создание аудио элемента, для озвучки рисования крестика или нолика
	var audioCheck = document.createElement("AUDIO");
	document.body.appendChild(audioCheck);
	audioCheck.setAttribute("src", "sound/check.ogg");
	fieldGames.check = audioCheck;
	
	var audioWin = document.createElement("AUDIO");
	document.body.appendChild(audioWin);
	audioWin.setAttribute("src", "sound/win.ogg");
	fieldGames.win = audioWin;
	
	var audioDefeat = document.createElement("AUDIO");
	document.body.appendChild(audioDefeat);
	audioDefeat.setAttribute("src", "sound/defeat.ogg");
	fieldGames.defeat = audioDefeat;	
};

//функция, которая реализует ход игрока
//@param: ev[object]-данные события
//		typeGamer[int] - тип игрока. 0 - нолики, 1 - крестики
//		refernEvents[object] - ссылка на событие, для закрытия, если ход сделан
function moveGamer(ev, typeGamer, refernEvents){
	var rows = Math.floor((ev.clientY - fieldGames.tabTop - fieldGames.sizeCell * 0.2)/fieldGames.sizeCell); 
	var couls = Math.floor((ev.clientX - fieldGames.tabLeft - fieldGames.sizeCell * 0.2)/fieldGames.sizeCell);
	var move = false;
	
	
	if (fieldGames.cells[rows][couls] === 0){
		move = true;
		
		if (typeGamer === 0){
			fieldGames.cells[rows][couls] = 1;
		} else {
			if (typeGamer === 1){
				fieldGames.cells[rows][couls] = 2;
			}
		}
		
		fieldGames.check.play();
		
		var position = new Array();
		position[0] = {r: rows, c: couls};
		drawIcons(position, typeGamer);
	}
	
	return move;
};


// ход алгоритма
// @parametrs: type[int] - тип фишек, за которые надо сделать ход
// @return: void

function moveAI(typeIcons){
	var i, j, l;
	var field = fieldGames;
	var rows = field.cells.length;
	var couls = field.cells[0].length;
	var important = new Array();
	var randIndex;
	var resultPosition;
	var turn;
	var otherType;
	var type;
	var supportSort;

	important = searchAddBlockCells();
	
	if (important.length > 0){
		// выбор наилучшего хода
		
		type = typeIcons + 1;
		
		if (type === 1){
			otherType = 2;
		} else {
			otherType = 1;
		}
		
		
		for (i = 0; i < important.length; i++){
			
			important[i].assessment = 0;
			
			for (turn = 0; turn < 8; turn++){
				switch (turn){
				case 0:
					if (important[i].c + 1 < couls && 
							(field.cells[important[i].r][important[i].c + 1] === 1 || 
									field.cells[important[i].r][important[i].c + 1] == 2)){
						if (field.cells[important[i].r][important[i].c + 1] === type){
							for (l = 1; l < 6; l++){
								if (!(important[i].c + l + 1 < couls && 
										field.cells[important[i].r][important[i].c + l + 1] === type))
									break;
							}
							
							important[i].assessment += valuingCells("add", l, type);
						} else {
							for (l = 1; l < 5; l++){
								if (!(important[i].c + l + 1 < couls && 
										field.cells[important[i].r][important[i].c + l + 1] === otherType))
									break;
							}
							
							important[i].assessment += valuingCells("block", l, type);
						}
					} else {
						if (important[i].c + 1 < couls && 
							field.cells[important[i].r][important[i].c + 1] == 3){
							important[i].assessment -= toFineCells(important[i].assessment);
						}
					}
				break;	
				case 1:
					if (important[i].c + 1 < couls && important[i].r + 1 < rows && 
							(field.cells[important[i].r + 1][important[i].c + 1] === 1 || 
									field.cells[important[i].r + 1][important[i].c + 1] == 2)){
						if (field.cells[important[i].r + 1][important[i].c + 1] === type){
							for (l = 1; l < 5; l++){
								if (!(important[i].c + l + 1 < couls && important[i].r + l + 1 < rows && 
										field.cells[important[i].r + l + 1][important[i].c + l + 1] === type))
									break;
							}
							
							important[i].assessment += valuingCells("add", l, type);
						} else {
							for (l = 1; l < 5; l++){
								if (!(important[i].c + l + 1 < couls && important[i].r + l + 1 < rows &&  
										field.cells[important[i].r + l + 1][important[i].c + l + 1] === otherType))
									break;
							}
							
							important[i].assessment += valuingCells("block", l, type);
						}
					} else {
						if (important[i].c + 1 < couls && important[i].r + 1 < rows && 
								field.cells[important[i].r + 1][important[i].c + 1] == 3){
							important[i].assessment -= toFineCells(important[i].assessment);
						}
					}
				break;
				case 2:
					if (important[i].r + 1 < rows && 
							(field.cells[important[i].r + 1][important[i].c] === 1 || 
									field.cells[important[i].r + 1][important[i].c] == 2)){
						if (field.cells[important[i].r + 1][important[i].c] === type){
							for (l = 1; l < 5; l++){
								if (!(important[i].r + l + 1 < rows && 
										field.cells[important[i].r + l + 1][important[i].c] === type))
									break;
							}
							
							important[i].assessment += valuingCells("add", l, type);
						} else {
							for (l = 1; l < 5; l++){
								if (!(important[i].r + l + 1 < rows && 
										field.cells[important[i].r + l + 1][important[i].c] === otherType))
									break;
							}
							
							important[i].assessment += valuingCells("block", l, type);
						}
					} else {
						if (important[i].r + 1 < rows && 
								field.cells[important[i].r + 1][important[i].c] == 3){
							important[i].assessment -= toFineCells(important[i].assessment);
						}
					}
				break;
				case 3:
					if (important[i].r + 1 < rows && important[i].c - 1 >= 0 && 
							(field.cells[important[i].r + 1][important[i].c - 1] === 1 ||
									field.cells[important[i].r + 1][important[i].c - 1] == 2)){
						if (field.cells[important[i].r + 1][important[i].c - 1] === type){
							for (l = 1; l < 5; l++){
								if (!(important[i].r + l + 1 < rows && important[i].c - l - 1 >= 0 && 
										field.cells[important[i].r + l + 1][important[i].c - l - 1] === type))
									break;
							}
							
							important[i].assessment += valuingCells("add", l, type);
						} else {
							for (l = 1; l < 5; l++){
								if (!(important[i].r + l + 1 < rows && important[i].c - l - 1 >= 0 &&
										field.cells[important[i].r + l + 1][important[i].c - l - 1] === otherType))
									break;
							}
							
							important[i].assessment += valuingCells("block", l, type);
						}
					} else {
						if (important[i].r + 1 < rows && important[i].c - 1 >= 0 && 
								field.cells[important[i].r + 1][important[i].c - 1] == 3){
							important[i].assessment -= toFineCells(important[i].assessment);
						}
					}
				break;
				case 4:
					if (important[i].c - 1 >= 0 && 
							(field.cells[important[i].r][important[i].c - 1] === 1 || 
									field.cells[important[i].r][important[i].c - 1] == 2)){
						if (field.cells[important[i].r][important[i].c - 1] === type){
							for (l = 1; l < 5; l++){
								if (!(important[i].c - l - 1 >= 0 && 
										field.cells[important[i].r][important[i].c - l - 1] === type))
									break;
							}
							
							important[i].assessment += valuingCells("add", l, type);
						} else {
							for (l = 1; l < 5; l++){
								if (!(important[i].c - l - 1 >= 0 && 
										field.cells[important[i].r][important[i].c - l - 1] === otherType))
									break;
							}
							
							important[i].assessment += valuingCells("block", l, type);
						}
					} else {
						if (important[i].c - 1 >= 0 && 
								field.cells[important[i].r][important[i].c - 1] == 3){
							important[i].assessment -= toFineCells(important[i].assessment);
						}
					}
				break;
				case 5:
					if (important[i].c - 1 >= 0 && important[i].r - 1 >= 0 && 
							(field.cells[important[i].r - 1][important[i].c - 1] === 1 || 
									field.cells[important[i].r - 1][important[i].c - 1] == 2)){
						if (field.cells[important[i].r - 1][important[i].c - 1] === type){
							for (l = 1; l < 5; l++){
								if (!(important[i].c - l - 1 >= couls && important[i].r - l - 1 >= 0 && 
										field.cells[important[i].r - l - 1][important[i].c - l - 1] === type))
									break;
							}
							
							important[i].assessment += valuingCells("add", l, type);
						} else {
							for (l = 1; l < 5; l++){
								if (!(important[i].c - l - 1 >= 0 && important[i].r - l - 1 >= 0 && 
										field.cells[important[i].r - l - 1][important[i].c - l - 1] === otherType))
									break;
							}
							
							important[i].assessment += valuingCells("block", l, type);
						}
					} else {
						if (important[i].c - 1 >= 0 && important[i].r - 1 >= 0 && 
								field.cells[important[i].r - 1][important[i].c - 1] == 3){
							important[i].assessment -= toFineCells(important[i].assessment);
						}
					}
				break;
				case 6:
					if (important[i].r - 1 >= 0 &&
							(field.cells[important[i].r - 1][important[i].c] === 1 ||
									field.cells[important[i].r - 1][important[i].c] == 2)){
						if (field.cells[important[i].r - 1][important[i].c] === type){
							for (l = 1; l < 5; l++){
								if (!(important[i].r - l - 1 >= 0 && 
										field.cells[important[i].r - l - 1][important[i].c] === type))
									break;
							}
							
							important[i].assessment += valuingCells("add", l, type);
						} else {
							for (l = 1; l < 5; l++){
								if (!(important[i].r - l - 1 >= 0 && 
										field.cells[important[i].r - l - 1][important[i].c] === otherType))
									break;
							}
							
							important[i].assessment += valuingCells("block", l, type);
						}
					} else {
						if (important[i].r - 1 >= 0 &&
								field.cells[important[i].r - 1][important[i].c] == 3){
							important[i].assessment -= toFineCells(important[i].assessment);
						}
					}
				break;
				default:
					if (important[i].c + 1 < couls && important[i].r - 1 >= 0 && 
							(field.cells[important[i].r - 1][important[i].c + 1] === 1 ||
									field.cells[important[i].r - 1][important[i].c + 1] == 2)){
						if (field.cells[important[i].r - 1][important[i].c + 1] === type){
							for (l = 1; l < 5; l++){
								if (!(important[i].c + l + 1 < couls && important[i].r - l - 1 >= 0 &&
										field.cells[important[i].r - l - 1][important[i].c + l + 1] === type))
									break;
							}
							
							important[i].assessment += valuingCells("add", l, type);
						} else {
							for (l = 1; l < 5; l++){
								if (!(important[i].c + l + 1 < couls && important[i].r - l - 1 >= 0 && 
										field.cells[important[i].r - l - 1][important[i].c + l + 1] === otherType))
									break;
							}
							
							important[i].assessment += valuingCells("block", l, type);
						}
					} else {
						if (important[i].c + 1 < couls && important[i].r - 1 >= 0 && 
								field.cells[important[i].r - 1][important[i].c + 1] == 3){
							important[i].assessment -= toFineCells(important[i].assessment);
						}
					}
				}
			}
		}
		
		// сортировка "значимых" клеток, по степени их оценки в порядке убывания.
		for (i = 0; i < important.length-1; i++){
			supportSort = {index: 0, max: 0};
			for (j = i; j < important.length; j++){
				if (important[j].assessment > supportSort.max){
					supportSort.index = j;
					supportSort.max = important[j].assessment;
				}
			}
		
			important.splice(i, 0, important[supportSort.index]);
			important.splice(supportSort.index + 1, 1);
		}	
		
		resultPosition = {r: important[0].r, c: important[0].c};
	} else {
		resultPosition = searchCenterSpace();
	}
	
	if (typeIcons === 0){
		field.cells[resultPosition.r][resultPosition.c] = 1;
	} else {
		if (typeIcons === 1){
			field.cells[resultPosition.r][resultPosition.c] = 2;
		}
	}
	
	field.check.play();

	var position = new Array();
	position[0] = {r: resultPosition.r, c: resultPosition.c};
	drawIcons(position, typeIcons);
	
	
	// простая выборка клеток, в которых можно дополнять и блокировать
	// @return: array[n](object) - клетка номера n
	//			array[n].r(num) - координата строки
	//			array[n].c(num) - координата столбца
	function searchAddBlockCells(){
		var i, j;
		var turn;
		var resultArray = new Array();
		var presentCell;
		var f = field;
		var r = rows;
		var c = couls;
		
		for (i = 0; i < r; i++){
			for (j = 0; j < c; j++){
				if (f.cells[i][j] === 0){
					presentCell = 0;
					
					for (turn = 0; turn < 8; turn++){
						switch (turn){
						case 0:
							if (j + 1 < c && (f.cells[i][j+1] === 1 || f.cells[i][j+1] == 2)){
								presentCell++;
							}
						break;	
						case 1:
							if (j + 1 < c && i + 1 < r && 
									(f.cells[i+1][j+1] === 1 || f.cells[i+1][j+1] == 2)){
								presentCell++;
							}
						break;
						case 2:
							if (i + 1 < r && 
									(f.cells[i+1][j] === 1 || f.cells[i+1][j] == 2)){
								presentCell++;
							}
						break;
						case 3:
							if (i + 1 < r && j - 1 >= 0 && 
									(f.cells[i+1][j-1] === 1 || f.cells[i+1][j-1] == 2)){
								presentCell++;
							}
						break;
						case 4:
							if (j - 1 >= 0 && 
									(f.cells[i][j-1] === 1 || f.cells[i][j-1] == 2)){
								presentCell++;
							}
						break;
						case 5:
							if (j - 1 >= 0 && i - 1 >= 0 && 
									(f.cells[i-1][j-1] === 1 || f.cells[i-1][j-1] == 2)){
								presentCell++;
							}
						break;
						case 6:
							if (i - 1 >= 0 &&
									(f.cells[i-1][j] === 1 || f.cells[i-1][j] == 2)){
								presentCell++;
							}
						break;
						default:
							if (j + 1 < c && i - 1 >= 0 && 
									(f.cells[i-1][j+1] === 1 || f.cells[i-1][j+1] == 2)){
								presentCell++;
							}
						}
						if (presentCell > 0){
							resultArray.push({r: i, c: j});
							break;
						}
					}
				}	
			}
		}
		
		return resultArray;
		
	};
		
	//поиск клетки которая является центром наиболее большого свободного квадрата
	function searchCenterSpace(){
		var section = new Array();
		var i, j, l;
		var f = field;
		var r = rows;
		var c = couls;
		
		if (c > r){
			var maxRadius = r;
		} else {
			var maxRadius = c; 
		}
		
		var supportSort;
		var beginPoint;
		var countSpace;
		var m, k, t;
		var result;
		var randomCells;
		
		// поиск отрезков строк
		for (i = 0; i < r; i++){
			l = 0;
			
			for (j = 0; j <= c; j++){
				if (j < c && f.cells[i][j] === 0){
					l++;
				} else {
					if (l > 0){					
						if (l !== 1 && l % 2 === 0){
							if (l == 2){
								section.push({r: i, c: j-1, l: 1, type: "rows"});
								section.push({r: i, c: j-2, l: 1, type: "rows"});
							} else {
								if ( l >= maxRadius){
									section.push({r: i, c: j-maxRadius-1, l: maxRadius, type: "rows"});
									section.push({r: i, c: j-maxRadius-2, l: maxRadius, type: "rows"});
								} else {
									section.push({r: i, c: j-l-1, l: l-1, type: "rows"});
									section.push({r: i, c: j-l-2, l: l-1, type: "rows"});
								}
								
							}
						} else {
							if (l >= maxRadius){
								section.push({r: i, c: j-maxRadius, l: maxRadius, type: "rows"});
							} else {
								if (l === 1){
									section.push({r: i, c: j-1, l: 1, type: "rows"});
								} else {
									section.push({r: i, c: j-l, l: l, type: "rows"});
								}
							}
						}
						
						l = 0;
					}
				}
			}
		}
		
		
		// поиск отрезков столбцов
		for (j = 0; j < c; j++){
			l = 0;
			
			for (i = 0; i <= r; i++){
				if (i < r && f.cells[i][j] === 0){
					l++;
				} else {
					if (l > 0){
						if (l !== 1 && l % 2 === 0){
							if (l == 2){
								section.push({r: i-2, c: j, l: 1, type: "couls"});
								section.push({r: i-1, c: j, l: 1, type: "couls"});
							} else {
								if ( l >= maxRadius){
									section.push({r: i-maxRadius-1, c: j, l: maxRadius-1, type: "couls"});
									section.push({r: i-maxRadius-2, c: j, l: maxRadius-1, type: "couls"});
								} else {
									section.push({r: i-l-1, c: j, l: l-1, type: "couls"});
									section.push({r: i-l-2, c: j, l: l-1, type: "couls"});
								}
							}
						} else {
							if (l >= maxRadius){
								section.push({r: i-maxRadius, c: j, l: maxRadius, type: "couls"});
							} else {
								if (l === 1){
									section.push({r: i-1, c: j, l: 1, type: "couls"});
								} else {
									section.push({r: i-l, c: j, l: l, type: "couls"});
								}
							}
						}
						
						l = 0;
					}
				}
			}
		}
		
		// сортировка массива отрезков. 
		// отрезки с самой боольшой длиной в начало
		for (i = 0; i < section.length-1; i++){
			supportSort = {index: 0, max: 0};
			for (j = i; j < section.length; j++){
				if (section[j].l > supportSort.max){
					supportSort.index = j;
					supportSort.max = section[j].l;
				}
			}
			
			section.splice(i, 0, section[supportSort.index]);
			section.splice(supportSort.index + 1, 1);
		}
		
		// проверка отрезков, на то, что они - часть пустого квадрата
		for (i = 0; i < section.length && section[i].l > 1; i++){
			if (section[i].type == "rows"){
				beginPoint ={r: section[i].r - Math.floor(section[i].l/2), c: section[i].c};
			} else {
				beginPoint ={r: section[i].r, c: section[i].c - Math.floor(section[i].l / 2)};
			}
			
			countSpace = 0;
			
			outSearchSq:
			
			for (m = 0; m < section[i].l; m++){
				if (section[i].type == "couls" || (m + beginPoint.r != section[i].r)){
					for(k = 0; k < section[i].l; k++){
						if (!(beginPoint.r >= 0 && beginPoint.r + m < r && beginPoint.c + k < c && 
								f.cells[beginPoint.r + m][beginPoint.c + k] === 0)){
							break outSearchSq;
						} else {
							countSpace++;
						}
					}
				} else {
					countSpace += section[i].l;
				}
			}
			
			if (countSpace == Math.pow(section[i].l, 2)){
				if (section[i].type == "rows"){
					result = {r: section[i].r, c: section[i].c + Math.floor(section[i].l/2)};
				} else {
					result = {r: section[i].r + Math.floor(section[i].l / 2), c: section[i].c};
				}
				
				break;
			}
		}
		
		if (result == undefined){
			if (section[0].type == "rows"){
				result = {r: section[0].r,
						c: section[0].c + Math.floor(section[0].l / 2)};
			} else {
				result = {r: section[0].r + Math.floor(section[0].l / 2), c: section[0].c};
			}
			
			return result;
		} else {
			return result;
		}
	};	
	// функция, которая начисляет баллы, при оценивании клетки
	// @param: acttion(string): add - "add"; block - "block"
	//			length(number): - длина ряда элементов
	function valuingCells(action, length, typeAI){
		var result;
		
		switch(length){
		case 1:
			if (action == "add")
				if (typeAI === 1)
					result = 2;
				else	
					result = 2;
			else
				if (typeAI === 1)
					result = 1;
				else	
					result = 1;
		break;
		case 2:
			if (action == "add")
				if (typeAI === 1)
					result = 3;
				else	
					result = 3;
			else
				if (typeAI === 1)
					result = 4;
				else	
					result = 3;
		break;
		case 3:
			if (action == "add")
				if (typeAI === 1)
					result = 5;
				else	
					result = 6;
			else
				if (typeAI === 1)
					result = 8;
				else	
					result = 7;
		break;
		default:
			if (action == "add")
				if (typeAI === 1)
					result = 100;
				else	
					result = 100;
			else
				if (typeAI === 1)
					result = 11;
				else	
					result = 10;
		}
		
		return result;
	};
	
	
	// функция по назначению штрафов для клетки,
	// если рядом с ней заштрихованная клетка
	// штраф назначается на основе имеющихся баллов у клетки
	function toFineCells(assessment){
		var result;
		
		if (assessment > 0){
			if (assessment < 8){
				result = 3;
			} else {
				result = 1;
			}
		} else {
			result = 0;
		}
		
		return result;
	};
};

// выбор действий при игре "С компьютером"

function choiceOfActionGameWithAI(){
	
	var move;
	var typeGamer;
	var clickUser;
	
	var rows;
	var couls;
	var coords;
	var i;
	var j;
	
	if (infoGames.statusGames === 0 || infoGames.statusGames === 1){
		if ((infoGames.statusGames === 0 && !infoGames.player1.AI) ||
				(infoGames.statusGames === 1 && infoGames.player1.AI)){
			if (infoGames.statusGames === 0){
				typeGamer = 0;
			} else {
				typeGamer = 1;
			}
			
			move = dojo.connect(
					fieldGames.refers,
					"onclick",
					null,
					function(evt){
						if (moveGamer(evt, typeGamer)){
							dojo.disconnect(move);
							settingStatus();
							infoGames.updateInfoBar();
							choiceOfActionGameWithAI();
						}
					});
		} else {
			// ход AI
			if (infoGames.player1.AI){
				moveAI(0);
			} else {
				moveAI(1);
			}
			
			settingStatus();
			infoGames.updateInfoBar();
			choiceOfActionGameWithAI();
		}
	} else {
		if(infoGames.statusGames == 2 || infoGames.statusGames == 3 || 
				infoGames.statusGames == 4){
				drawIcons(findWinLines(infoGames.statusGames - 1), 4);
				
				// выбор сигнала в зависимости от победы или поражения игрока
				if (infoGames.statusGames == 2 && !infoGames.player1.AI || 
							infoGames.statusGames == 3 && infoGames.player1.AI 
									|| infoGames.statusGames == 4){
					fieldGames.win.play();
				} else {
					fieldGames.defeat.play();
				}
				
				clickUser = dojo.connect(
				fieldGames.refers,
				"onclick",
				null,
				function(){
						dojo.disconnect(clickUser);
						
						switch (infoGames.statusGames){
						case 2:
							infoGames.player1.score++;
						break;
						case 3:
							infoGames.player2.score++;
						break;
						default:
							infoGames.player1.score++;
							infoGames.player2.score++;
						}
						
						infoGames.numberOfGames++;
						
						rows = fieldGames.cells.length;
						couls = fieldGames.cells[0].length;
						coords = new Array();
						
						for (i = 0; i < rows; i++){
							for (j = 0; j < couls; j++){
								if (fieldGames.cells[i][j] === 1 || fieldGames.cells[i][j] == 2){ 
									fieldGames.cells[i][j] = 3;
									coords.push({r: i, c: j});
								}
							}
						}
						
						drawIcons(coords, 3);
						
						approximationCells(5);
						
						settingStatus();
						infoGames.updateInfoBar();
						choiceOfActionGameWithAI();
					}
			);
		} else {
			infoGames.updateInfoBar();
			clickUser = dojo.connect(
					fieldGames.refers,
					"onclick",
					null,
					function(){
						dojo.disconnect(clickUser);
						document.body.innerHTML = "";
						createMenuGames();
						infoGames = {};
						fieldGames = {};
					});
		}
	}
};


// фкнкция, которая для заданных координат рисует требуемые элементы
function drawIcons(coordinates, typeIcons){
	var ctx = fieldGames.ctx;
	var sizeCell = fieldGames.sizeCell;
	var nomerIndex;
	var coordRows, coordRows_1, coordRows_2;
	var coordCouls, coordCouls_1, coordCouls_2;
	var i;
	var index_1, index_2;
	
	switch (typeIcons){
	case 0:
		ctx.beginPath();
		
		for (nomerIndex in coordinates){
			coordRows = coordinates[nomerIndex].r * sizeCell;
			coordCouls = coordinates[nomerIndex].c * sizeCell;
			ctx.arc(coordCouls + sizeCell * 0.5, coordRows + sizeCell * 0.5,
					0.3 * sizeCell, 0, Math.PI * 2);
		}
		
		ctx.closePath();
		ctx.lineWidth = sizeCell * 0.2;
		ctx.strokeStyle = "#0B2";
		ctx.stroke();
		
	break;
	case 1:
		ctx.beginPath();
		
		for (nomerIndex in coordinates){
			coordRows = coordinates[nomerIndex].r * sizeCell;
			coordCouls = coordinates[nomerIndex].c * sizeCell;
			ctx.moveTo(coordCouls + sizeCell * 0.2, coordRows + sizeCell * 0.2);
			ctx.lineTo(coordCouls + sizeCell * 0.8, coordRows + sizeCell * 0.8);
			ctx.moveTo(coordCouls + sizeCell * 0.8, coordRows + sizeCell * 0.2);
			ctx.lineTo(coordCouls + sizeCell * 0.2, coordRows + sizeCell * 0.8);
		}
		
		ctx.closePath();
		ctx.lineWidth = sizeCell * 0.2;
		ctx.strokeStyle = "#D00";
		ctx.stroke();
	break;
	case 3:	
		ctx.fillStyle = "#DDD";
		
		for (nomerIndex in coordinates){
			coordRows = coordinates[nomerIndex].r * sizeCell;
			coordCouls = coordinates[nomerIndex].c * sizeCell;
			ctx.fillRect(coordCouls, coordRows, sizeCell, sizeCell);
		}
	break;
	case 4:
		
		ctx.beginPath();
		
		for (i = 0; i < coordinates.length/2; i++){
			if (i === 0){
				index_1 = 0;
				index_2 = 1;
			} else {
				index_1 = 2;
				index_2 = 3;
			}
			
			coordRows_1 = coordinates[index_1].r * sizeCell;
			coordCouls_1 = coordinates[index_1].c * sizeCell;
			coordRows_2 = coordinates[index_2].r * sizeCell;
			coordCouls_2 = coordinates[index_2].c * sizeCell;
			ctx.moveTo(coordCouls_1 + sizeCell * 0.5, coordRows_1 + sizeCell * 0.5);
			ctx.lineTo(coordCouls_2 + sizeCell * 0.5, coordRows_2 + sizeCell * 0.5);
		}
		
		ctx.closePath();
		ctx.lineWidth = sizeCell * 0.2;
		ctx.strokeStyle = "#00F";
		ctx.stroke();
	break;
	
	}
};


// функция, которая на основании текущего статуса игры
// и информации о игровом поле назначает текущий статус
function settingStatus(){
	var rows = fieldGames.cells.length;
	var couls = fieldGames.cells[0].length;
	var continueGames = false;
	
	outDoubleFor:
		
	for (var i = 0; i < rows; i++){
		for (var j = 0; j < couls; j++){
			if (fieldGames.cells[i][j] === 0){
				continueGames = true;
				break outDoubleFor;
			}
		}
	}
	
	if (continueGames){
		switch (infoGames.statusGames) {
		case 0:
			if (findLineElements(0, true) && !findLineElements(1, false)){
				infoGames.statusGames = 2;
			} else {
				infoGames.statusGames = 1;
			}
		break;
		case 1:
			if(findLineElements(1, true)){
				if(findLineElements(0, true)){
					infoGames.statusGames = 4;
				} else {
					infoGames.statusGames = 3;
				}
			} else {
				infoGames.statusGames = 0;
			}
		break;
		default:
			
			infoGames.statusGames = 0;
		}
	} else {
		infoGames.statusGames = 5;
	}
};


// ищет "линии" из одинаковых элементов
// горизонтальные, вертикальные и диогональные
// @return: type[int] - обозначет тип элементов, из которых состоит линия. 0 - "нолики" 1 - "крестики"
//			length[int] - длина искомой линии
//			close[boolen] - тип проверки. 	true - нормальный поиск
//											false - ищется диния с возможностью дополнения элементом на следующем ходе
// @return: [boolen] true - успешный поиск, false - иначе

function findLineElements(type, close){
	type++;
	var findLength = 0;
	var  turn; // вправо, вниз-вправо, вниз, вниз-влево	
	var rows = fieldGames.cells.length;
	var couls = fieldGames.cells[0].length;
	var result = false;
	
	outFromFors:
	
	for (var i = 0; i < rows; i++){
		for (var j = 0; j < couls; j++){			
			if (fieldGames.cells[i][j] === type){
				findLength = 1;
				
				for (turn = 0; turn < 4; turn++){
					switch(turn){
					case 0:
						if (close){
							for(var l = 1; l < 5; l++){
								if (j+l < couls && fieldGames.cells[i][j+l] === type){
									findLength++;
								} else {
									findLength = 1;
									break;
								}
							}
						}else{
							for(var l = 1; l <= 4; l++){
								if (j+l < couls && fieldGames.cells[i][j+l] === type || 
										(findLength == 4 && 
												((j+l < couls && fieldGames.cells[i][j+l] === 0) || 
														(j-1 >= 0 && fieldGames.cells[i][j-1] === 0)))){
									findLength++;
								} else {
									findLength = 1;
									break;
								}
							}
						}
						
					break;
					case 1:
						if (close){
							for(var l = 1; l < 5; l++){
								if (l+i < rows && j+l < couls && 
								        fieldGames.cells[l+i][j+l] === type){
									findLength++;
								} else {
									findLength = 1;
									break;
								}
							}
						}else{
							for(var l = 1; l <= 4; l++){
								if (i+l < rows && j+l < couls && fieldGames.cells[i+l][j+l] === type || 
										(findLength == 4 && 
												((i+l < rows && j+l < couls && fieldGames.cells[i+l][j+l] === 0) || 
												(i-1 >= 0 && j-1 >= 0 && fieldGames.cells[i-1][j-1] === 0)))){
									findLength++;
								} else {
									findLength = 1;
									break;
								}
							}
						}
					break;
					case 2:
						if (close){
							for(var l = 1; l < 5; l++){
								if (i+l < rows && fieldGames.cells[i+l][j] === type){
									findLength++;
								} else {
									findLength = 1;
									break;
								}
							}
						}else{
							for(var l = 1; l <= 4; l++){
								if (i+l < rows && fieldGames.cells[i+l][j] === type || 
										(findLength == 4 && 
												((i+l < rows && fieldGames.cells[i+l][j] === 0) || 
												(i-1 >= 0 && fieldGames.cells[i-1][j] === 0)))){
									findLength++;
								} else {
									findLength = 1;
									break;
								}
							}
						}
					break;
					default:
						if (close){
							for(var l = 1; l < 5; l++){
								if (i+l < rows && j-l >= 0 && 
										fieldGames.cells[i+l][j-l] === type){
									findLength++;
								} else {
									break;
								}
							}
						}else{
							for(var l = 1; l <= 4; l++){
								if (i+l < rows && j-l >= 0 && 
										fieldGames.cells[i+l][j-l] === type || 
											(findLength == 4 && 
													((i+l < rows && j-l >= 0 && fieldGames.cells[i+l][j-l] === 0) ||
													(i-1 >= 0 && j+1 < couls && fieldGames.cells[i-1][j+1] === 0)))){
									findLength++;
								} else {
									break;
								}
							}
						}
					}
					
					if(findLength == 5){				
						result = true;
						break outFromFors;
					}
				}
			}
		}
	}
	
	return result;
}

/*  Ищет собранные линии крестиков или ноликов
 *  
 *  @param: typeFind(number) - указавыет на тип поиска
 *  						typeFind = 1, ищет законченый ряд из ноликов
 *  						typeFind = 2, ищет зак-й ряд из крестиков
 *  						typrFind = 3, и из крестиков, и из ноликов
 *  @param: line(Array) - информация, необходимая для построения линии
 */

function findWinLines(typeFind){
	var field = fieldGames;
	var result = new Array();
	
	if (typeFind === 1){
		result = result.concat(findLine(1));
	} else {
		if (typeFind == 2){
			result = result.concat(findLine(2));
		} else {
			result = result.concat(findLine(1));
			result = result.concat(findLine(2));
		}
	}
	
	return result;
	
	
	// функция, которая ищет ряд из элементов
	// определенного типа
	
	function findLine(type){
		var line = new Array();
		var supportArray = new Array();
		var lengthFinds;
		
		var f = field;
		var rows = field.cells.length;
		var couls = field.cells[0].length;
		
		var i, j, l;
		var turn;
	
		outFromFors:
			
			for (var i = 0; i < rows; i++){
				for (var j = 0; j < couls; j++){			
					if (f.cells[i][j] === type){					
						for (turn = 0; turn < 4; turn++){
							lengthFinds = 1;
							supportArray[0] = {r: i, c: j};
							
							switch(turn){
							case 0:
								for(var l = 1; l < 5; l++){
									if (j + l < couls && f.cells[i][j+l] === type){
										lengthFinds++;
										supportArray[1] = {r: i, c: j + l};
									} else {
										break;
									}
								}					
							break;
							
							case 1:
								for(var l = 1; l < 5; l++){
									if (l + i < rows && j + l < couls && 
									        f.cells[l+i][j+l] === type){
										lengthFinds++;
										supportArray[1] = {r: i + l, c: j + l};
									} else {
										break;
									}
								}
							break;
							
							case 2:
								for(var l = 1; l < 5; l++){
									if (i + l < rows && f.cells[i+l][j] === type){
										lengthFinds++;
										supportArray[1] = {r: i + l, c: j};
									} else {
										break;
									}
								}
							break;
							
							default:
								for(var l = 1; l < 5; l++){
									if (i + l < rows && j - l >= 0 && 
											f.cells[i+l][j-l] === type){
										lengthFinds++;
										supportArray[1] = {r: i + l, c: j - l};
									} else {
										break;
									}
								}	
							}
							
							if (lengthFinds == 5){
								line[0] = supportArray[0];
								line[1] = supportArray[1];
								break outFromFors;
							}
						}
					}
				}
			}
			
	return line;
		
	};
}


// функция, которая после раунда затирает клетки, в которых нельзя постротить линии
// то есть она апраксимирует отдельные пустые клетки
// @return: length[int] - уровень апроксимации 

function approximationCells(length){
		if (length > 0){
			var section = new Array();
			var i, j, l;
			var field = fieldGames;
			var rows = field.cells.length;
			var couls = field.cells[0].length;
			var position = new Array();
			
			if (couls > rows){
				var maxRadius = rows;
			} else {
				var maxRadius = couls; 
			}
				
			// поиск отрезков строк
			for (i = 0; i < rows; i++){
				l = 0;
				
				for (j = 0; j <= couls; j++){
					if (j < couls && field.cells[i][j] === 0){
						l++;
					} else {
						if (l > 0){
							if (l > 1){
								if (l > maxRadius){
									section.push({r: i, c: j-maxRadius, l: maxRadius, type: "rows"});
								} else {
									section.push({r: i, c: j-l, l: l, type: "rows"});
								}
							} else {
								section.push({r: i, c: j-1, l: 1, type: "rows"});
							}
							
							l = 0;
						}
					}
				}
			}

			
			// поиск отрезков столбцов
			for (j = 0; j < couls; j++){
				l = 0;
				
				for (i = 0; i <= rows; i++){
					if (i < rows && field.cells[i][j] === 0){
						l++;
					} else {
						if (l > 0){
							if (l > 1){
								if (l > maxRadius){
									section.push({r: i-maxRadius, c: j, l: maxRadius, type: "couls"});
								} else {
									section.push({r: i-l, c: j, l: l, type: "couls"});
								}
							} else {
								section.push({r: i-1, c: j, l: 1, type: "couls"});
							}
							
							l = 0;
						}
					}
				}
			}
			
			// удаление отрезков, длина которых меньше значения апроксимации
			// так же подготовка массива, для закрашивания клеток
			for (i = 0; i < section.length; i++){
				if (section[i].l <= length){
					if (field.cells[section[i].r][section[i].c] != 3){
						if (section[i].type == "rows"){
							for (j = 0; j < section[i].l; j++){
								field.cells[section[i].r][section[i].c + j] = 3;
								position.push({r: section[i].r, c: section[i].c + j});
							}
						} else {
							for (j = 0; j < section[i].l; j++){
								field.cells[section[i].r + j][section[i].c] = 3;
								position.push({r: section[i].r + j, c: section[i].c});
							}
						}
					}
				}
			}
			
			drawIcons(position, 3);
			
			length--;
			approximationCells(length);
		}
};
