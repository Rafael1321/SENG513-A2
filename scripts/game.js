/* GAME STATE */

    let grid = null;

    // Players
    let players = null;
    let currentPlayerIdx = null;

    // Colors
    const p1Color = (opacity=1.0) => `rgb(60, 69, 206, ${opacity})`;
    const p2Color = (opacity=1.0) => `rgb(129, 244, 149, ${opacity})`;
    const p3Color = (opacity=1.0) => `rgb(240, 102, 95, ${opacity})`;

/* GAME LOGIC */

    function initGame(width, height, numOfPlayers){
        // TODO: Parse the URL here, instead of accepting parameters
        initPlayers(numOfPlayers);
        initGrid(width, height);
    }

    function initPlayers(numOfPlayers){

        // Creating a list of player and shuffling it (so there is a randomness on who starts)
        players = [
            {playerNum: 0, score:0,color:p1Color},
            {playerNum: 1, score:0,color:p2Color},
            (numOfPlayers === 3 ? {playerNum: 2, score:0,color:p3Color} : null)
        ].sort( () => Math.random() - 0.5);
        currentPlayerIdx = 0;

        selectPlayerUI();
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
        currentPlayerIdx = (currentPlayerIdx + 1) % (players[2]?3:2);
        selectPlayerUI();
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
        
        const grid = document.getElementById("grid");
        let rows = ""

        for(let i = 0; i < height; i++){
            rows += "<tr>";
            for(let j = 0; j < width; j++){
                rows += `<td id="box-${i}-${j}">`
                rows += getGridElement(i, j, i === height - 1, j === width - 1);
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
    function getGridElement(i, j, isLastHorizontal = false, isLastVertical = false){
        
        let element = `<div class="up-left-corner"></div> 
                       <div id="top-${i}-${j}" class="top-line"></div>
                       <div id="left-${i}-${j}" class="left-line"></div>`

        if(isLastHorizontal && isLastVertical){
            element +=  `<div class="down-left-corner"></div>
                         <div id="bottom-${i}-${j}" class="bottom-line"></div>
                         <div class="up-right-corner"></div>
                         <div id="right-${i}-${j}" class="right-line"></div>
                         <div class="down-right-corner"></div>`;
        }else if(isLastHorizontal){
            element += `<div class="down-left-corner"></div>
                        <div id="bottom-${i}-${j}" class="bottom-line"></div>`
        }else if(isLastVertical){
            element += `<div class="up-right-corner"></div>
                        <div id="right-${i}-${j}" class="right-line"></div>`
        }
        return element;
    }

    function addLineListeners(lineType) {
        // Get reference to grid and all lines of the provided type
        const grid = document.getElementById("grid");
        const lines = grid.getElementsByClassName(lineType);

        for(let i = 0; i < lines.length; i++){
            lines[i].addEventListener('click', onLineClick);
            lines[i].addEventListener('mouseover', onLineHover);
            lines[i].addEventListener('mouseleave', onLineLeave);
        }
    }

    function onLineHover(event){
        let isVertical = event.target.classList.contains('left-line') || event.target.classList.contains('right-line');
        event.target.classList.add(isVertical?'line-hover-vertical':'line-hover-horizontal')
        event.target.classList.remove('line-leave')
    }

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
        event.target.style.filter = `drop-shadow(0rem 0rem 0.3rem ${players[currentPlayerIdx].color()})`;
        
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

        if(isGameOver()){
            window.location.href=`./results.html?playerNum=${findWinner()}`;
        }
    }

    /* OTHER UI COMPONENTS */

    function colorBoxes(boxes){
        boxes.forEach( boxId => {
            let box = document.getElementById(boxId);
            box.style.background = players[currentPlayerIdx].color(0.3);
            box.style.filter = `drop-shadow(0rem 0rem 0.6rem ${players.find(p => p.playerNum === players[currentPlayerIdx].playerNum).color()})`
        });
    }

    function selectPlayerUI(){

        let player1Img = document.getElementById("player1").getElementsByTagName("div")[0];
        let player2Img = document.getElementById("player2").getElementsByTagName("div")[0];
        let player3Img = document.getElementById("player3").getElementsByTagName("div")[0];

        // Change the color of the player who plays next
        switch(players[currentPlayerIdx].playerNum){
            case 0:
                player1Img.style.filter = `drop-shadow(0rem 0rem 0.2rem ${players.find(p => p.playerNum === 0).color()})`;
                player2Img.style.filter = '';
                player3Img.style.filter = ''; 
                break;
            case 1:
                player1Img.style.filter = ''
                player2Img.style.filter = `drop-shadow(0rem 0rem 0.2rem ${players.find(p => p.playerNum === 1).color()})`;
                player3Img.style.filter = ''; 
                break;
            case 2:
                player1Img.style.filter = ''; 
                player2Img.style.filter = ''
                player3Img.style.filter = `drop-shadow(0rem 0rem 0.2rem ${players.find(p => p.playerNum === 2).color()})`;
                break;
        }
    }

/* GAME ENTRY-POINT */
    initGame(4, 4, 3);