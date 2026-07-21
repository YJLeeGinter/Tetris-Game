const tetrisGameContainer = document.querySelector(".tetris-game-container");
const tetriminoTable = document.getElementById("tetrimino");
const tetrisTable = document.getElementById("tetris");

const gameStartBtn = document.querySelector(".start-btn");
const gamePauseBtn = document.querySelector(".pause-btn");

const tetroArr = [];
const nextTetrominoArr = [];
const rotatedShapeArr = [];

const rows = 20, cols = 10;
const tetrisTableDataArr = Array.from({ length: rows }, () => Array(cols).fill(0));

let tetrisRowEndPos = tetrisTableDataArr.length;
let tetrisStart = 1;

let timerID;

let shapeFirstPosArr;

const speedInfo = {
  base: 500,
  fast: 50
};

// let greyTetroInfoArr = [];

let speed = speedInfo.base;
let deleteRow = false;

let isEnabled = false;

class Tetromino {
    constructor(name, shape, color) {
      this.name = name;  
      this.shape = shape;  // 2D Array representing the Tetromino
      // 정사각형 형태의 배열만 입력하도록 제한한다
      this.color = color;  // Color of the Tetromino
      tetroArr.push(this);
      this.firstColsStartPos = 3;  // Starting position
      this.firstRowsStartPos = 0;
      this._size;
      this.active = 0;
      this.rotatedShape = []; // 빈 배열을 truty value. truty or false value 차이점이 버그를 발생시킬 수 있다.
      this.tempRotatedShape = [];
    } 

    // 각 테트로 크기 구하기
    get size(){
      return this._size;
    }

    set size(shapeArr){
      this._size = shapeArr.length;
    }

     // 또 다른 방법은 정사각형 배열을 만들지 말고 행과 열을 바꾼다. 
     // 이거 수정!! 시작점(회전 중심점) 구하기가 중요하다.
     // 배열을 돌리면 살짝 어긋나는 부분이 있다. 이는 선형대수 공식을 이용하든 말든 생기는 문제
     // 배열을 돌리고 나서 어긋나는 부분 (offset)을 수정하는 함수
      rotate(shape){ 
      const copiedShapeArr = JSON.parse(JSON.stringify(shape));

      const size = copiedShapeArr.length;
      // console.log('copied arr check', copiedShapeArr);
      this.rotatedShape= Array.from({length : size}, () => Array(size).fill(0));
      //console.log(this.tempRotatedShape)
    
        for(let i =0; i < size; i++){
          for(let j =0; j < size; j++){
            if(copiedShapeArr[i][j]){
              this.rotatedShape[j][size-1-i] = copiedShapeArr[i][j];
            }
           
            }
          }
            return this.rotatedShape;
          }
      
    deleteRotatedShape() {
      this.rotatedShape.length = 0;
    }
   

    tempRotate(tempShape){
      // 이것은 행과 열을 바꾸는 방법
      // 정사각형이 아닐때도 사용할 수 있다.

            const copiedShapeArr = JSON.parse(JSON.stringify(tempShape));
            const rowSize = tempShape.length;
            const colSize = tempShape[0].length;
            console.log('copied shape arr', copiedShapeArr);
           if(this.tempRotatedShape.length != 0) this.tempRotatedShape.length = 0;
      
           // if(rowSize === colSize) return this.rotatedShape = shape;
            
            // 열을 돌면서 행을 만들자
            
            for(let i = 0; i < colSize; i++){
              this.tempRotatedShape.push([]);
              for(let j = rowSize - 1; j>=0 ; j--){
                this.tempRotatedShape[i].push(copiedShapeArr[j][i]);
              }
            }

      return this.tempRotatedShape;
    }

}

const T_Tetromino = new Tetromino(
  "T",
  [  
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ],
  "purple",
 
);


const I_Tetromino = new Tetromino(
  "I",
  [ 
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0]  
  ],
  "cyan",
 
);


const L_Tetromino = new Tetromino(
  'L',
  [ 
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  "orange",
  
);

const O_Tetromino = new Tetromino(
  'O',
  [ 
    [1,1],
    [1,1],   
  ],
  "yellow",
 
);

const J_Tetromino = new Tetromino(
  'J',
  [   
    [0,0,1],
    [1,1,1],
    [0,0,0]
  ],
  "blue",
  
); 

const S_Tetromino = new Tetromino(
  'S',
  [  
    [0,1,1],
    [1,1,0],
    [0,0,0]
  ],
  "green",
  
);

const Z_Tetromino = new Tetromino(
  'Z',
  [ 
    [1,1,0],
    [0,1,1],
    [0,0,0]
  ],
  "red",
 
);  

function drawEmptyTetrisTable(){
  for (let i = 0; i < rows; i++) { // Create 20 rows
    
    let row = document.createElement("tr");
  
      for (let j = 0; j < cols; j++) { // Each row has 10 columns
        let cell = document.createElement("td");
        row.appendChild(cell);
      }
  
    tetrisTable.appendChild(row);
  
  }

}

function getRandomTetromino() {

  const randomKey = Math.floor(Math.random() * tetroArr.length); // Pick a random key

    return tetroArr[randomKey];
}

function drawTetromino (nextTetro){

  nextTetro.size= nextTetro.shape;
  const size = nextTetro.size;
    
    for(let i = 0; i < size; i++){
      let row = document.createElement("tr");
        for(let j = 0; j < size; j++){
          let cell = document.createElement("td");
          row.appendChild(cell);
        }
        tetriminoTable.appendChild(row);
    }  

    for(let i = 0; i < size; i++){
        for(let j = 0; j < size; j++){     
            if(nextTetro.shape[i][j] === 1){
                tetriminoTable.rows[i].cells[j].style.backgroundColor = nextTetro.color;
            } 
        }
    }
    // 왔다 갔다 왔다 갔다
   
   while(tetriminoTable.rows.length != 4){
    
    let row = document.createElement("tr");
    for(let j = 0; j < size; j++){
      let cell = document.createElement("td");
      row.appendChild(cell);
    }

    if(tetriminoTable.rows.length % 2 != 0){
      tetriminoTable.prepend(row);

    }else{
      tetriminoTable.appendChild(row);

    }
   }

   while(tetriminoTable.rows[0].cells.length != 4){
    
    if(tetriminoTable.rows[0].cells.length % 2 != 0){
      for(let i = 0; i < 4; i++){
        tetriminoTable.rows[i].insertCell(-1);
      }
    }else{
      for(let i = 0; i < 4; i++){
        tetriminoTable.rows[i].insertCell(0);
      }
    }

   }

} 

function findCurrentStat(arr) {
// 이차원 배열에서 현재 상태를 가지고 있는 열을 찾아 행과 열에 관한  정보를 따로 놓아두고
// 그 정보를 바탕으로 아무런 인풋이 없으면 그 정보에대가 행만 1 추가하고
// 그리고 그 정보에 있는 열을 지운다.
// 마지막으로 그 정보를 바탕으로 테트리노를 그린다.
let matchedObjectInfo = [];

arr.forEach(row => {
  for(let i =0; i < row.length; i++){
    if(row[i].currentStatus === 1){
      
      matchedObjectInfo.push(row[i]) // 참조 복사. 즉 얕은 복사
    }
  }
}); 
  return matchedObjectInfo; 
}  

function compare(a, b) {
  if (a > b) return 1; // 첫 번째 값이 두 번째 값보다 큰 경우
  if (a == b) return 0; // 두 값이 같은 경우
  if (a < b) return -1; //  첫 번째 값이 두 번째 값보다 작은 경우
}

function showGreyTetro(){
  
  const curTetroTableData = findCurrentStat(tetrisTableDataArr, {currentStatus : 1});
  const greyFristRow = curTetroTableData[curTetroTableData.length - 1].rowIndex + 1;
  // console.log(curTetroTableData)
 // 테트로에서 겹치는 부분을 제거하고 비교하자. 즉 칼럼 인덱스가 같으면 행이 큰 것만 추린다.

  const curTetroColIndexArr = [];
  const curTetroRowIndexArr = [];

  curTetroTableData.forEach(item => {
    curTetroColIndexArr.push(item.colIndex);
  });

  curTetroTableData.forEach(item => {
    curTetroRowIndexArr.push(item.rowIndex);

  });
  
   const colIndexArr = [...new Set(curTetroColIndexArr)];
   colIndexArr.sort(compare);

   const rowIndexArr = [...new Set(curTetroRowIndexArr)];
   rowIndexArr.reverse();

  // 테트리스 테이블에서 부딪힐 가능성이 있는 부분을 추려낸다.
  // 정보가 있는 데서 부터 부딪히나 안 부딪히나 확인 후 부딪히는 부분에서 멈춰서 회색 테트로를 그린다.
  
  let toBeCheckedArr;

  for(let i = greyFristRow; i < rows; i++){
   
    if(toBeCheckedArr) break;

    for(let j = 0; j < colIndexArr.length ; j++){
      let colIndex = colIndexArr[j];
      if(tetrisTableDataArr[i][colIndex]){
        toBeCheckedArr = tetrisTableDataArr.slice(i, rows);
        break;
      }
    }
  }

  if(toBeCheckedArr){
    
// 부딪히는 게 있을 때
const copiedCurTetroData = JSON.parse(JSON.stringify(curTetroTableData));
const greyRowArr = [];

 const tempArr = []; // 안 겹치는 것만 모아둔 배열

 // console.log(toBeCheckedArr)
 let greyLastRow = toBeCheckedArr[0].find(item => item != 0).rowIndex - 1;
 
  for(let i = 0; i < rowIndexArr.length; i++){
    let rowInfoObj = {
      rowIndex : rowIndexArr[i],
      greyRowIndex : greyLastRow - i,
    };
    greyRowArr.push(rowInfoObj);
  }

  // 각 행은 붙어 있다. 따라서 매칭 함수가 가능.
  for(let i = copiedCurTetroData.length - 1; i>=0; i--){
    const rowInfo = greyRowArr.find(rowInfoObj => rowInfoObj.rowIndex === copiedCurTetroData[i].rowIndex);
    copiedCurTetroData[i].rowIndex = rowInfo.greyRowIndex;
  }

  for(let i = copiedCurTetroData.length-1; i >= 0; i-- ){

    if(colIndexArr.length === 0) break;
  
    for(let j = colIndexArr.length -1 ; j >=0; j--){
      if(copiedCurTetroData[i].colIndex == colIndexArr[j]){
        tempArr.push(copiedCurTetroData[i]);
        colIndexArr.splice(j,1);
        break;
      }
    }
  
   }
  
  // console.log('temp current tetro array', tempArr)
   tempArr.reverse();

// 안 겹치는 테트로 배열이 내려갈 수 있는가 없는가를 확인한다.
 let startFlag = 1;
 let startPos = 1; 
 let rowDifference = 0; 

 while(startFlag){

  for(let j = 0; j < tempArr.length; j++){
   // console.log(tempArr[j])
    let nextRowIndex = tempArr[j].rowIndex + startPos;
  // console.log('Tetris table next Row Index', nextRowIndex); 
  if(nextRowIndex === 20){
    startFlag = 0;
   
    // 이걸 기준으로 차이점을 구해서 현재 테트로 배열에 적용한다. 
     rowDifference = nextRowIndex - tempArr[j].rowIndex;
    // console.log('difference', rowDifference)
    break;
  }
  let colIndex = tempArr[j].colIndex;

    if(tetrisTableDataArr[nextRowIndex][colIndex]){ 
    
    startFlag = 0;
   
    // 이걸 기준으로 차이점을 구해서 현재 테트로 배열에 적용한다. 
     rowDifference = nextRowIndex - tempArr[j].rowIndex;
    // console.log('difference', rowDifference)
    break;
  }
}
  
 startPos++;

 }
  
 copiedCurTetroData.forEach(tetroInfo => {
  tetroInfo.rowIndex = tetroInfo.rowIndex + rowDifference - 1;
 })

 
  for(let i = 0; i < copiedCurTetroData.length; i++){
    let rowIndex = copiedCurTetroData[i].rowIndex;
    let colIndex = copiedCurTetroData[i].colIndex;
   
    tetrisTable.rows[rowIndex].cells[colIndex].style.backgroundColor ='grey';

  }

}else{

// 맨 끝에 닿았을 때

   const rowIArr = [];
   curTetroTableData.forEach(item => rowIArr.push(item.rowIndex));
   // 맨 마지막은 19

   const rowIndexArr = [...new Set(rowIArr)];
   const rowIndexInfo = [];
    let counter = 0;
   for(let i = rowIndexArr.length - 1 ; i >=0; i--){
     rowIndexInfo.push({original : rowIndexArr[i], grey : rows - 1 - counter})
     counter++;
   }

   for(let i = curTetroTableData.length-1 ; i >= 0 ; i--){
  let rowIndex;
  let colIndex = curTetroTableData[i].colIndex;

  for(let j = 0; j < rowIndexInfo.length; j++){
    if(curTetroTableData[i].rowIndex === rowIndexInfo[j].original){
      rowIndex = rowIndexInfo[j].grey;
      break;
    }
  }
  
  tetrisTable.rows[rowIndex].cells[colIndex].style.backgroundColor ='grey';
  
}

  }

}

function isNextLeftEmpty(currentTetrominoArr){

  // 왼쪽으로 갈 수 있을까? 없을까?
  let nextMove = 1;
  // 열 위치 중 가장 작은 숫자를 찾고 그게 부딪히냐 안 부딪히냐 확인.
  // 첫 열의 위치가 같으면 그게 비교해야 할 열
  // 첫 열의 위치가 다르면 두 개를 비교해서 작은 거 하나만 비교함
  let colIndexArr = []
  currentTetrominoArr.forEach(item => colIndexArr.push(item.colIndex))
  let leftColIndex = Math.min(...colIndexArr);
  const leftCols = currentTetrominoArr.filter(item => item.colIndex === leftColIndex)
  
  for(let i = 0; i < leftCols.length; i++){


  if(leftCols[i].colIndex <=0){ // 왼쪽 끝에 닿았을때 
    // 끝에 닿는 경우도 한 행만 확인하면 된다
    nextMove = 0; 
    return nextMove;
  } 

  // 테트리스는 올라갈 수 없다. 좌 우 밑을 확인
  // 밑인 경우는 테트리미노의 한 행만 확인
  // 좌 우 인 경우에는 각각 한 열만 확인
 // 여기 수정
 
 if(tetrisTableDataArr[leftCols[i].rowIndex][leftCols[i].colIndex - 1]) { 
   //   왼쪽으로 가다가 다음 행이나 열이랑 부딪힐때. 
    nextMove = 0;
    return nextMove;
  } 
  
  }

  // 테트로가 부딪혔을 때에도 움직이면 안 된다.
  nextMove = isNextMoveEmpty(currentTetrominoArr);

  return nextMove;
}

function moveToLeft(keyName) {
  checkGameOver();
  const currentTetrominoArr = findCurrentStat(tetrisTableDataArr, {currentStatus : 1});
  const activeTetromino = findActiveTetro();

// 행과 열을 바꿔서 확인. 
// 열에 데이터가 하나만 있을때
// 열에 데이터가 다 있을때
// 포인트를 결정 후 움직인다.
// 마지막에 테트리스가 닿기 전 왼쪽이나 오른쪽으로 갈 때 에러가 생긴다 << 버그 수정
  const goLeft = isNextLeftEmpty(currentTetrominoArr); // 버그 수정 참고 사항 여기에서 못 가게 막아야 한다
  
  if(goLeft){
   
    deleteTetrisTable();

    for(let i = 0; i < currentTetrominoArr.length; i++){

      let nextCol = currentTetrominoArr[i].colIndex - 1;
      tetrisTableDataArr[currentTetrominoArr[i].rowIndex][currentTetrominoArr[i].colIndex] = 0; // 미리 0을 선언하여 주소값을 끊어준다. 
      tetrisTableDataArr[currentTetrominoArr[i].rowIndex][nextCol] = currentTetrominoArr[i];
      tetrisTableDataArr[currentTetrominoArr[i].rowIndex][nextCol].firstColPos -=1;
      tetrisTableDataArr[currentTetrominoArr[i].rowIndex][nextCol].colIndex = nextCol; 
    
  }
  
  drawEmptyTetrisTable();
  drawTetrisTable();
  showGreyTetro();

  checkUserInputUp(keyName);

  }
  
}

function isNextRightEmpty(currentTetrominoArr){

  // 오른쪽으로 갈 수 있을까? 없을까?
  let nextMove = 1;
  // 열 위치 중 가장 큰 숫자를 찾고 그게 부딪히냐 안 부딪히냐 확인.
  // 마지막 열의 위치가 같으면 그게 비교해야 할 열
  // 마지막 열의 위치가 다르면 두 개를 비교해서 작은 거 하나만 비교함
  let colIndexArr = []
  currentTetrominoArr.forEach(item => colIndexArr.push(item.colIndex))
  let leftColIndex = Math.max(...colIndexArr);
  const rightCols = currentTetrominoArr.filter(item => item.colIndex === leftColIndex)
  
  for(let i = 0; i < rightCols.length; i++){


  if(rightCols[i].colIndex >= cols -1){ // 오른쪽 끝에 닿았을때 
    // 끝에 닿는 경우도 한 행만 확인하면 된다
    nextMove = 0; 
    return nextMove;
  } 

  // 테트리스는 올라갈 수 없다. 좌 우 밑을 확인
  // 밑인 경우는 테트리미노의 한 행만 확인
  // 좌 우 인 경우에는 각각 한 열만 확인
 // 여기 수정
 
 if(tetrisTableDataArr[rightCols[i].rowIndex][rightCols[i].colIndex + 1]) { 
   //   오른쪽으로 가다가 다음 행이나 열이랑 부딪힐때. 
    nextMove = 0;
    return nextMove;
  } 
  
  }
  nextMove = isNextMoveEmpty(currentTetrominoArr);
  return nextMove;
}

function moveToRight(keyName) {

 // console.log(keyName)

  const currentTetrominoArr = findCurrentStat(tetrisTableDataArr, {currentStatus : 1});
  const activeTetromino = findActiveTetro();
 
  //console.log('currentTetrominoArr',currentTetrominoArr)
  //console.log('activeDataSet', activeDataSet)
// 행과 열을 바꿔서 확인. 
// 열에 데이터가 하나만 있을때
// 열에 데이터가 다 있을때
// 포인트를 결정 후 움직인다.

  const goRight = isNextRightEmpty(currentTetrominoArr);
  
  if(goRight){
    deleteTetrisTable();

    for(let i = currentTetrominoArr.length-1; i >=0; i--){

      let nextCol = currentTetrominoArr[i].colIndex + 1;
      tetrisTableDataArr[currentTetrominoArr[i].rowIndex][currentTetrominoArr[i].colIndex] = 0; // 미리 0을 선언하여 주소값을 끊어준다. 
      tetrisTableDataArr[currentTetrominoArr[i].rowIndex][nextCol] = currentTetrominoArr[i];
      tetrisTableDataArr[currentTetrominoArr[i].rowIndex][nextCol].firstColPos +=1;
      tetrisTableDataArr[currentTetrominoArr[i].rowIndex][nextCol].colIndex = nextCol; 
 
  }
  drawEmptyTetrisTable();
  drawTetrisTable();

  showGreyTetro();

  checkUserInputUp(keyName)
  }
}

function changeSpeed (eventType){
  
  if(eventType === 'keydown'){
    speed = speedInfo.fast;
  }else if(eventType === 'keyup'){
    speed = speedInfo.base;
  }
}


function rotateTetro(){
  const activeTetro = findActiveTetro();
  const currentTetrominoArr = findCurrentStat(tetrisTableDataArr, {currentStatus : 1});
  const size = activeTetro.size;

  let rotatedShape;

  // I, S, Z는 한번만 돌아간다. 그리고 처음으로 돌아간다. 
  const shapeName = activeTetro.name;

  const posInfoArr = JSON.parse(JSON.stringify(currentTetrominoArr[0]));

  const firstRowPos = posInfoArr.firstRowPos;
  const firstColPos = posInfoArr.firstColPos;


  if(firstColPos < 0 || firstColPos + size > cols) return;


  if(activeTetro.rotatedShape.length != 0){
    // 순환이 한 번 이상 된 경우

    switch (shapeName) {
      case "I":
      case "S": // (*) 두 case문을 묶음
      case "Z":
        activeTetro.deleteRotatedShape();
        rotatedShape = activeTetro.shape;
        break;
    
      default:
        rotatedShape = activeTetro.rotate(activeTetro.rotatedShape);
       // console.log('rotated several times',activeTetro.rotatedShape );
    }

  }else{
    // 첫 순환
    rotatedShape = activeTetro.rotate(activeTetro.shape);
   // console.log('rotated first time', rotatedShape)
  }
  
  activeTetro.size = rotatedShape;
  
  
     
 currentTetrominoArr.forEach(obj => {
    tetrisTableDataArr[obj.rowIndex][obj.colIndex] = 0;
  });

  currentTetrominoArr.length = 0;

  for(let i = 0; i < size; i++){
    for(let j = 0; j < size; j++ ){
      // 열의 위치로 테트로가 돌아갈 수 있는지 없는지를 파악한다.
       if(j+firstColPos < 0){
       //  return;
       }
      
      if(rotatedShape[i][j]){
        tetrisTableDataArr[i+firstRowPos][j+firstColPos] = { data : 1, 
                  color:activeTetro.color , currentStatus: 1,
                  rowIndex: i+firstRowPos, colIndex: j+firstColPos,
            // 시작점 고려
                  firstRowPos: firstRowPos, firstColPos: firstColPos
                    }; // 화면에 표현하기 전에 데이터 먼저

         }
    //  console.log(tetrisTableDataArr)
    }
  }
  
//deleteGreyTetro();
deleteTetrisTable();
drawEmptyTetrisTable();

drawTetrisTable();
showGreyTetro();

}

function checkUserInputDown(event){
  if(isEnabled) return;
  // console.log(window.pageYOffset)
  const keyName = event.key;
  const eventType = event.type;

  switch (keyName) {
    case 'ArrowLeft':
     moveToLeft(keyName);
      break;
    case 'ArrowRight':
      moveToRight(keyName);
      break;
    case 'ArrowUp':
      rotateTetro(keyName);
      break;
    case 'ArrowDown':
      changeSpeed(eventType);
      break;
  }
  
  event.preventDefault(); 
  // Optional: Prevent the default browser action (e.g., scrolling)
  
  return keyName;
}

function checkUserInputUp(event){

  const keyName = event.key;
  const eventType = event.type;
  speed = speedInfo.base;
  switch(keyName){
    case 'ArrowDown':
      changeSpeed(eventType);
      break;
    case 'ArrowLeft':
      break;
    case 'ArrowRight':
      break;
    case 'ArrowUp':
      break;  
    default:

    break; 
  }

}

function deleteTetrisTable(){
  tetrisTable.innerHTML = '';
}

function deleteTetrominoTable(){
  tetriminoTable.innerHTML = '';
}

function drawTetrisTable(){
  for(let i = 0; i < rows; i++){
    for(let j =0; j < cols; j++){
      if(tetrisTableDataArr[i][j]){
        tetrisTable.rows[i].cells[j].style.backgroundColor =tetrisTableDataArr[i][j].color;
      }
    }
  }
}

function isNextMoveEmpty(currentTetrominoArr){
      
   let nextMove = true;
 
   // 끝이 경우 마지막 한 행만 확인한다.
 for(let i = currentTetrominoArr.length-1; i >= 0; i-- ){
   if(currentTetrominoArr[i].rowIndex >=  tetrisTableDataArr.length -1){
     nextMove = false; 
     return nextMove;
   }
 
 }
 
 // 무조건 한 칸씩 내려온다.
 // 회색 테트로(미리보기 테트로)와 같은 논리
 // 1. 맨 밑에 있는 행이 다른 테트로와 부딪히는지 확인한다.
 // 테트로 마지막 행 위치 구해서 그것만 확인하자.
 
 // 2. 맨 밑에 있는 행 말고 그 위에 행이 다른 테트로와 부딪히는지 확인한다.
 // 높이만큼 한 칸씩 내린다. 부딪히면 멈추고 아니면 패스

 // 테트로에서 겹치는 부분을 제거하고 비교하자. 즉 칼럼 인덱스가 같으면 행이 큰 것만 추린다.
 
 const curTetroColIndexArr = [];

currentTetrominoArr.forEach(item => {
  curTetroColIndexArr.push(item.colIndex);
})

  const colIndexArr = [...new Set(curTetroColIndexArr)];
 // console.log(colIndexArr);
//  const checkLength = currentTetrominoArr.length - colIndexArr.length;
 const tempArr = []; // 안 겹치는 것만 모아둔 배열

 for(let i = currentTetrominoArr.length-1; i >= 0; i-- ){

  if(colIndexArr.length === 0) break;

  for(let j = colIndexArr.length -1 ; j >=0; j--){
    if(currentTetrominoArr[i].colIndex == colIndexArr[j]){
      tempArr.push(currentTetrominoArr[i]);
      colIndexArr.splice(j,1);
      break;
    }
  }

 }

 for(let i = 0; i < tempArr.length; i++){
   let rowIndex = tempArr[i].rowIndex;
   let colIndex = tempArr[i].colIndex;

   if(tetrisTableDataArr[rowIndex+1][colIndex]){
     nextMove = false;
     return nextMove;
   }
 }

   return nextMove;
 }

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 게임이 시작되면 밑으로 계속 내려가는 것은 디폴트

function moveTetromino(){
 
  const currentTetrominoArr = findCurrentStat(tetrisTableDataArr, {currentStatus : 1});
  // 여기에서 끝에 닿았느냐? 아니면 다른 테트리미노와 부딪혔는가를 파악. 
  // 장애물이 있거나 방향키 작동했을때 
   // 상수. 주소값이 아니다.       
      
  const nextMove = isNextMoveEmpty(currentTetrominoArr);
  
  deleteTetrisTable();
  drawEmptyTetrisTable();

  if(nextMove){ // 내려갈 때
    
    for(let i = currentTetrominoArr.length -1; i >= 0; i--){

      let nextRow = currentTetrominoArr[i].rowIndex + 1;
      tetrisTableDataArr[currentTetrominoArr[i].rowIndex][currentTetrominoArr[i].colIndex] = 0; // 미리 0을 선언하여 주소값을 끊어준다. 
    
      tetrisTableDataArr[nextRow][currentTetrominoArr[i].colIndex] = currentTetrominoArr[i];
      tetrisTableDataArr[nextRow][currentTetrominoArr[i].colIndex].rowIndex = nextRow; 
      tetrisTableDataArr[nextRow][currentTetrominoArr[i].colIndex].firstRowPos +=1;
    // tetrisTableDataArr[row[i].rowIndex][row[i].colInex] = 0;  // 여기에서 바꾸면 작동이 안된다. 
    // 왜? 포인터 문제. 깊은 복사 얕은 복사. 참조 문제
    // 즉 여기에서 0을 해버리면 nextrow에서 참조하는 게 0을 가리키게 되어서. 
    // 겹치는 부분이 0이 되어서 사라져버린다. 순서대로 하면
    
     }
     
   
     showGreyTetro();
     drawTetrisTable();
     checkGameOver();

     timerID =  setTimeout(moveTetromino, speed)
   }else{ // 내려가지 못할 때는 부딪힌다. 여기에서 충돌 여부 확인
    if(checkGameOver()){
      return;
    }

    currentTetrominoArr.forEach(obj => {
      obj.currentStatus = 0;
    });
    
    deactivateTetro();
    const result = checkTetrisTableRows();

   if(result.flag){
    isEnabled = true;
    let rowCounter = result.fullRowIndex.length;

    for(let i =0; i < rowCounter; i++){
      for(let j=0; j < cols; j++){
        // 이게 먼저 보여진다.
        tetrisTableDataArr[result.fullRowIndex[i]][j] = { color: 'pink' };         
      }
     
    }
    deleteTetrisTable();
    drawEmptyTetrisTable();
    drawTetrisTable();

    delay(2000).then(() => {
    for(let i = 0; i < rowCounter; i++){
      let firstRowInfo = tetrisTableDataArr.findIndex(eachRow => {
        return eachRow.some(col => col.data === 1);
      }); // 데이터가 있는 첫번째 행 구하기

      // 테트리스 데이터 정보 변경
      firstRowInfo = firstRowInfo === -1 ? 0 : firstRowInfo;

      for(let j = firstRowInfo; j < result.fullRowIndex[i]; j++){

        tetrisTableDataArr[j].forEach(eachCol => { 
          if(eachCol != 0){
            eachCol.rowIndex = eachCol.rowIndex + 1;
          }
        })
      }
      tetrisTableDataArr.splice(result.fullRowIndex[i], 1);
      const newRow = new Array(cols).fill(0);
      tetrisTableDataArr.unshift(newRow);

    }
    const curTetro = nextTetrominoArr[0];
      curTetro.active = 1;

    deleteTetrisTable();
    drawEmptyTetrisTable();
    drawFirstCurrentTetro(curTetro);
    deleteTetrominoTable();

    nextTetrominoArr.pop();
    const nextTetro = pickNextTetro();
     
    drawTetromino(nextTetro);
    drawTetrisTable();
    isEnabled = false;

    
     timerID =  setTimeout(moveTetromino, speed); // 새로운 테트로가 내려올 때 속도는 초기화가 되어야 한다.
    
    });
   }else{
    const curTetro = nextTetrominoArr[0];
    curTetro.active = 1;
   
    drawFirstCurrentTetro(curTetro);
   
    deleteTetrominoTable();

    nextTetrominoArr.pop();
    const nextTetro = pickNextTetro();
     
    drawTetromino(nextTetro);
    drawTetrisTable();
    
     timerID =  setTimeout(moveTetromino, speed); // 새로운 테트로가 내려올 때 속도는 초기화가 되어야 한다.
   }
    
   }

}

function findActiveTetro(){

  return tetroArr.filter(item => item.active === 1)[0];
}

function pickNextTetro(){
  const nextTetromino = getRandomTetromino();
  nextTetrominoArr.push(nextTetromino);
  
  return nextTetrominoArr[0];

}

function deactivateTetro(){
  tetroArr.forEach((item) => {
    if(item.active === 1){
      item.active = 0;
    
      if(item.rotatedShape.length != 0) item.deleteRotatedShape();
     
      return;
    } 
  });
}

function pickFirstTetro(){
  const currentTetro = getRandomTetromino();  
  currentTetro.active = 1;
  return currentTetro;
}

function checkTetrisTableRows(){
  const fullRowIndex = []; // 행이 여러개가 꽉 찰수도 있다.

  for(let i =0; i < rows; i++){
    let counter = 0;
    for(let j = 0; j < cols; j++){
      // && tetrisTableDataArr[i][j].color != 'grey' 
      if(tetrisTableDataArr[i][j] != 0 ) counter++;
    }
    if(counter === cols) fullRowIndex.push(i);
  }
  
  if(fullRowIndex.length === 0){
    return {flag : false};
  }else{
    return {flag : true, fullRowIndex : fullRowIndex}
  }
  
}

function drawFirstCurrentTetro(currentTetro){

  if(checkGameOver()) return;
  
  const tetrominoShape = currentTetro.shape;
 
  currentTetro.size = tetrominoShape;

  const firstRowsStartPos = currentTetro.firstRowsStartPos;
 

  const size = currentTetro.size;

  for(let i = 0; i < size; i++){
    for(let j =0 ; j < size; j++){
      
      if(tetrominoShape[i][j]){
       
        tetrisTableDataArr[i][currentTetro.firstColsStartPos + j] = {  
                      color: currentTetro.color , currentStatus: 1,
                      rowIndex: i, colIndex: currentTetro.firstColsStartPos + j,
                      firstRowPos: firstRowsStartPos, firstColPos: currentTetro.firstColsStartPos
                      }; // 화면에 표현하기 전에 데이터 먼저
                     
           continue;
         }
      }   
   }
 
   drawTetrisTable();
   showGreyTetro();
   console.log(tetrisTableDataArr)
}

function checkGameOver(){
  let count = 0;
  tetrisTableDataArr.forEach(eachRow => {
  let temp = eachRow.filter(eachCol => eachCol != 0);
  if(temp.length != 0) count++;
  });
  
  if(count === rows){
  alert('Game Over');
  tetrisGameContainer.style.display = "none";
  nextTetrominoArr.pop();
  deactivateTetro();

  gameStartBtn.disabled = false;
  
  tetrisTableDataArr.forEach(eachRow => eachRow.fill(0));
  deleteTetrisTable();
  deleteTetrominoTable();
  console.log(tetrisTableDataArr);
  return true;
  }
  return false;
}

function startGame(event){

    gameStartBtn.disabled = true;
    tetrisGameContainer.classList.add('tetris-game-container-active');
    drawEmptyTetrisTable();
    
    const nextTetro = pickNextTetro();
    drawTetromino(nextTetro);

    const firstTetro = pickFirstTetro();
    drawFirstCurrentTetro(firstTetro);

    speed = speedInfo.base;
    timerID = setTimeout(moveTetromino, speed);
    event.preventDefault(); 

}

function pauseGame(){
  if(gamePauseBtn.textContent === 'Resume'){
    gamePauseBtn.textContent = 'Pause';
    timerID =  setTimeout(moveTetromino, speed);
  }else{
  clearTimeout(timerID);
   gamePauseBtn.textContent = 'Resume';
  }
}

document.addEventListener('keydown', checkUserInputDown);
document.addEventListener('keyup', checkUserInputUp);

gameStartBtn.addEventListener('click', startGame);
gamePauseBtn.addEventListener('click', pauseGame);

tetrisGameContainer.addEventListener('touchstart', function (event) {
  console.log(event)
  touchstartX = event.changedTouches[0].screenX;
  touchstartY = event.changedTouches[0].screenY;
  event.preventDefault(); 

}, false);

tetrisGameContainer.addEventListener('touchend', function (event) {
  touchendX = event.changedTouches[0].screenX;
  touchendY = event.changedTouches[0].screenY;
  event.preventDefault(); 

  handleGesture();
}, false);


function handleGesture() {
  if (touchendX < touchstartX) {
      console.log('Swiped Left');
      let keyName = 'Swiped Left';
      moveToLeft(keyName);
  }

  if (touchendX > touchstartX) {
      console.log('Swiped Right');
      let keyName = 'Swiped Right';
      moveToRight(keyName);
  }

  if (touchendY < touchstartY) {
      console.log('Swiped Up');
      
  }

  if (touchendY > touchstartY) {
      console.log('Swiped Down');
      
  }

  if (touchendY === touchstartY) {
      console.log('Tap');
      let keyName = 'Tap'
      rotateTetro(keyName);
  }
}
