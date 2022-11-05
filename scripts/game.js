/* GAME STATE */

    window.history.forward();

    // url parsing
    const params = new URLSearchParams(window.location.search);

    // Game Grid
    let grid = null;

    // Players
    let players = null;
    let currentPlayerIdx = null;

    // Colors
    const p1Color = (opacity=1.0) => `rgb(60, 69, 206, ${opacity})`;
    const p2Color = (opacity=1.0) => `rgb(129, 244, 149, ${opacity})`;
    const p3Color = (opacity=1.0) => `rgb(240, 102, 95, ${opacity})`;

/* GAME LOGIC */

    function initGame(){
        const width = parseInt(params.get('width')?? 4);
        const height = parseInt(params.get('height')??4);
        const numPlayers = parseInt(params.get('numPlayers')??3);

        initPlayers(numPlayers);
        initGrid(width - 1, height - 1);
    }

    function initPlayers(numOfPlayers){

        // Creating a list of player and shuffling it (so there is a randomness on who starts)
        players = [
            {playerNum: 0, score:0,color:p1Color},
            {playerNum: 1, score:0,color:p2Color},
        ];

        if(numOfPlayers === 3){
            players.push({playerNum: 2, score:0,color:p3Color});
            players.sort( () => Math.random() - 0.5);
        }else{
            players.sort( () => Math.random() - 0.5);
            players.push(null);
        }
        currentPlayerIdx = 0;

        if(numOfPlayers == 2) hidePlayer();
        colorPlayer();
    }

    function initGrid(width, height){
        // Create necessary data stucture storing what lines where already picked
        grid = Array.from(Array(height), () => new Array(width));
        for(let i = 0; i < height; i++){
            for(let j = 0; j < width; j++){
                grid[i][j] = {lineTop:false, lineBottom:false, lineLeft:false, lineRight:false};
            }
        }     
        drawGrid(width, height);
    }

    function handleTurn(wasBoxCompleted){
        if(wasBoxCompleted) return; // Current player gets one more turn because they completed a box.
        currentPlayerIdx = (currentPlayerIdx + 1) % (players[2] !== null?3:2);
        colorPlayer();
    }

    function handleScore(numOfCompletedBoxes){
        if(numOfCompletedBoxes <= 0) return;
        let scoreSpan = document.getElementById(`player${players[currentPlayerIdx].playerNum + 1}`).getElementsByTagName('span')[0];
        players[currentPlayerIdx].score += numOfCompletedBoxes;
        scoreSpan.textContent = `Score: ${players[currentPlayerIdx].score}`;
    }

    function isGameOver(){
        let gameOver = true;
        grid.forEach(row => { 
            row.forEach( box => {
                if(!isBoxCompleted(box)) gameOver = false; 
            })
        });
        return gameOver;
    }

    // Updates the grid data structure after a player adds a line.
    // It will return true if the addition of the line, results in a completed box
    function updateGrid(lineId){

        let lineClass = "line-";

        // Top, Right, Left, or Bottom
        let location = lineId.substring(0, lineId.indexOf("-"));        
        lineId = lineId.substring(lineId.indexOf("-") + 1);

        // Location in the datastructure
        let x = lineId.substring(0, lineId.indexOf("-"))
        let y = lineId.substring(lineId.indexOf("-") + 1);
        lineClass += location

        // Used to hold all the boxes that were completed
        let completedBoxes = [];

        switch(lineClass){
            case 'line-left':
                grid[x][y].lineLeft = true;
                if(y - 1 >= 0){ // it's not left most line in the grid
                    grid[x][y-1].lineRight = true;
                }
                break;
            case 'line-right':
                grid[x][y].lineRight = true;
                break;
            case 'line-top':
                grid[x][y].lineTop = true
                if(x - 1 >= 0){ // it's not top most line in the grid
                    grid[x-1][y].lineBottom = true;
                }
                break;
            case 'line-bottom':
                grid[x][y].lineBottom = true;
                break;
        }

        // Finding all boxes that have completed (if any)
        if(isBoxCompleted(grid[x][y])) completedBoxes.push(`box-${x}-${y}`);

        if(location === 'left'){
            if(y-1 >= 0 && isBoxCompleted(grid[x][y-1])) completedBoxes.push(`box-${x}-${y-1}`);
        }else if(location === 'top'){
            if(x-1 >= 0 && isBoxCompleted(grid[x-1][y])) completedBoxes.push(`box-${x-1}-${y}`);
        }

        return completedBoxes;
    }

    // Checks if all lines of a box have been filled
    function isBoxCompleted(box){
        return box.lineLeft && box.lineRight && box.lineTop && box.lineBottom;
    }

    // Checkes whether there is a tie in the game
    function isTie(){
        let tie = players[0].score === players[1].score;
        if(players[2] !== null){
            tie = tie && (players[1].score === players[2].score);
        }
        return tie;
    }

    // Returns the player index of the player who has highest score
    function findWinner(){
        if(isTie()) return 0;
        let  maxScorePlayer = (players[0].score > players[1].score)?players[0]:players[1];
        maxScorePlayer = (players[2] !== null && players[2].score > maxScorePlayer.score)?players[2]:maxScorePlayer;
        return maxScorePlayer.playerNum + 1;
    }

/* UI HANDLING */

    /* GRID RELATED */

    // Creates the entire grid of the specified width and height
    function drawGrid(width, height){
        
        const audioPath = './assets/sounds/box-completed.wav';

        const grid = document.getElementById("grid");
        let rows = ""

        for(let i = 0; i < height; i++){
            rows += "<tr>";
            for(let j = 0; j < width; j++){
                rows += `<td id="box-${i}-${j}">`
                rows += getGridElement(i, j, i === height - 1, j === width - 1);
                rows += `<audio id="box-completed-${i}-${j}">
                            <source src="${audioPath}" type="audio/wav">
                         </audio>`
                rows += '</td>'
            }
            rows += "</tr>";
        }

        grid.innerHTML = rows;
        addLineListeners('top-line');
        addLineListeners('left-line');
        addLineListeners('right-line');
        addLineListeners('bottom-line');
    }

    // Returns an element of a grid (dots and lines)
    // It also includes an audio tag per each line, so sounds can be played independently.
    function getGridElement(i, j, isLastHorizontal = false, isLastVertical = false){
        
        const audioPath = './assets/sounds/line-created.wav';

        let element = `<div class="up-left-corner"></div> 
                       <div id="top-${i}-${j}" class="top-line"></div>
                       <div id="left-${i}-${j}" class="left-line"></div>
                       <audio id="top-line-created-${i}-${j}">
                            <source src="${audioPath}" type="audio/wav">
                       </audio>
                       <audio id="left-line-created-${i}-${j}">
                            <source src="${audioPath}" type="audio/wav">
                       </audio>`;

        // If lines and dots are occuring in last row and column.
        if(isLastHorizontal && isLastVertical){
            element +=  `<div class="down-left-corner"></div>
                         <div id="bottom-${i}-${j}" class="bottom-line"></div>
                         <audio id="bottom-line-created-${i}-${j}">
                            <source src="${audioPath}" type="audio/wav">
                         </audio>
                         <div class="up-right-corner"></div>
                         <div id="right-${i}-${j}" class="right-line"></div>
                         <audio id="right-line-created-${i}-${j}">
                         <source src="${audioPath}" type="audio/wav">
                         </audio>
                         <div class="down-right-corner"></div>`;
        }else if(isLastHorizontal){ // if lines and dots occur in the the last line.
            element += `<div class="down-left-corner"></div>
                        <div id="bottom-${i}-${j}" class="bottom-line"></div>
                        <audio id="bottom-line-created-${i}-${j}">
                            <source src="${audioPath}" type="audio/wav">
                        </audio>`;
        }else if(isLastVertical){ // if lines and dots occur in the last column
            element += `<div class="up-right-corner"></div>
                        <div id="right-${i}-${j}" class="right-line"></div>
                        <audio id="right-line-created-${i}-${j}">
                            <source src="${audioPath}" type="audio/wav">
                         </audio>`;
        }

        return element;
    }

    function addLineListeners(lineType) {
        // Get reference to grid and all lines of the provided type
        const grid = document.getElementById("grid");
        const lines = grid.getElementsByClassName(lineType);

        // Adding three types of event listeners to each line
        for(let i = 0; i < lines.length; i++){
            lines[i].addEventListener('click', onLineClick);
            lines[i].addEventListener('mouseover', onLineHover);
            lines[i].addEventListener('mouseleave', onLineLeave);
        }
    }

    // When the mouse hovers over a line...
    function onLineHover(event){
        let isVertical = event.target.classList.contains('left-line') || event.target.classList.contains('right-line');
        event.target.classList.add(isVertical?'line-hover-vertical':'line-hover-horizontal')
        event.target.classList.remove('line-leave')
    }

    // When the mouse leaves a line...
    function onLineLeave(event){
        let isVertical = event.target.classList.contains('left-line') || event.target.classList.contains('right-line');
        event.target.classList.add('line-leave');
        event.target.classList.remove(isVertical?'line-hover-vertical':'line-hover-horizontal')
    }

    function onLineClick(event){
        // Do not change lines that are already colored
        if(event.target.style.filter !== '') return;

        let isVertical = event.target.classList.contains('left-line') || event.target.classList.contains('right-line');            
    
        // Change color of line based on currently selected player
        if(isVertical) {
            event.target.style.borderLeft = `5px solid ${players[currentPlayerIdx].color()}`;
        }else{
            event.target.style.borderTop = `5px solid ${players[currentPlayerIdx].color()}`;
        }      
    
        // Adding some colored-blur to the lines
        event.target.style.filter = `drop-shadow(0 0 0.3rem ${players[currentPlayerIdx].color()})`;
        
        // Get rid of any previous styling
        event.target.classList.remove(isVertical?'line-hover-vertical':'line-hover-horizontal');
        event.target.classList.remove('line-leave');

        // Get rid of any event listeners 
        event.target.removeEventListener('mouseover', onLineHover);
        event.target.removeEventListener('mouseleave', onLineLeave);

        // Handle UI Changes
        let completedBoxes = updateGrid(event.target.id);
        handleScore(completedBoxes.length);
        handleTurn(completedBoxes.length > 0);
        colorBoxes(completedBoxes);

        // Playing sound for newly created line
        if(completedBoxes.length === 0) playCreatedLineSound(event.target);
 
        // Checking if all boxes have been filled and waiting for a bit (so it feels more natural)
        if(isGameOver()){
            setTimeout(() => {
                window.location.href=`./results.html?playerNum=${findWinner()}`;
            }, 500);        
        }

        bringDotsToFront() // Making sure there is no overlap of lines and points
    }

    /* OTHER UI COMPONENTS */

    function colorBoxes(boxes){
        boxes.forEach( boxId => {
            let box = document.getElementById(boxId);
            box.style.background = players[currentPlayerIdx].color(0.3);
            box.style.filter = `drop-shadow(0rem 0rem 0.3rem ${players.find(p => p.playerNum === players[currentPlayerIdx].playerNum).color()})`         
            box.style.zIndex = 0;
            playCompletedBoxSound(boxId);
        });
    }

    function colorPlayer(){

        let player1Img = document.getElementById("player1").getElementsByTagName("img")[0];
        let player2Img = document.getElementById("player2").getElementsByTagName("img")[0];
        let player3Img = document.getElementById("player3").getElementsByTagName("img")[0];

        // Change the color of the player who plays next
        switch(players[currentPlayerIdx].playerNum){
            case 0:
                player1Img.style.boxShadow = `0rem 0rem 1.5rem 0.8rem ${players.find(p => p.playerNum === 0).color()}`;
                player2Img.style.boxShadow = '';
                player3Img.style.boxShadow = ''; 
                break;
            case 1:
                player1Img.style.boxShadow = ''
                player2Img.style.boxShadow = `0rem 0rem 1.5rem 0.2rem ${players.find(p => p.playerNum === 1).color()}`;
                player3Img.style.boxShadow = ''; 
                break;
            case 2:
                player1Img.style.boxShadow = ''; 
                player2Img.style.boxShadow = ''
                player3Img.style.boxShadow = `0rem 0rem 1.5rem 0.2rem ${players.find(p => p.playerNum === 2).color()}`;
                break;
        }
    }

    // Used to hide a player in case only two players are to play
    function hidePlayer(playerNum=3){
        const player = document.getElementById(`player${playerNum}`);
        player.style.display = 'none';
    }

    // Each time a line is drawn, this function brings all points to the front
    function bringDotsToFront(){
        bringDotTypeToFont('up-left-corner');
        bringDotTypeToFont('down-left-corner');
        bringDotTypeToFont('up-right-corner');
        bringDotTypeToFont('down-right-corner');
    }

    // Brings all points of the specified type to the front
    function bringDotTypeToFont(type){
        let dots = document.getElementsByClassName(type);
        for(let i = 0; i < dots.length; i++){
            dots[i].style.zIndex = 10;
        }
    }

    /* SOUNDS */ 

    function playCreatedLineSound(line){
        let tmp = line.id.substring(line.id.indexOf('-') + 1);
        let x = tmp.substring(0, tmp.indexOf('-'));
        let y = tmp.substring(tmp.indexOf('-') + 1);
        document.getElementById(`${line.classList.value}-created-${x}-${y}`).play();
    }

    function playCompletedBoxSound(boxId){
        let tmp = boxId.substring(boxId.indexOf('-') + 1);
        let x = tmp.substring(0, tmp.indexOf('-'));
        let y = tmp.substring(tmp.indexOf('-') + 1);
        document.getElementById(`box-completed-${x}-${y}`).play();
    }

    // Adding listeners to buttons 
    document.getElementById('home').addEventListener('mouseenter', () => {
        document.getElementById('button-hover-1').play();
    });
    document.getElementById('home').addEventListener('click', () => {
        document.getElementById('button-click').play();
        setTimeout(() => {
            window.location.href=`./index.html`;
        }, 500);        
    });
    document.getElementById('restart').addEventListener('mouseenter', () => {
        document.getElementById('button-hover-2').play();
    });
    document.getElementById('restart').addEventListener('click', () => {
        document.getElementById('button-click').play();
        setTimeout(() => {
            window.location.href=`./game.html?width=${params.get('width')}&height=${params.get('height')}&numPlayers=${params.get('numPlayers')}`;
        }, 500);        
    });

/* GAME ENTRY-POINT */
    initGame();