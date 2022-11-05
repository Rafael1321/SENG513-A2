// Reference to DOM Elements
const playButton = document.getElementsByTagName('a')[0];
const numPlayersSelect = document.getElementById('player-num');
const gridSizeSelect = document.getElementById('grid-sizes');

// Finding Number of Players 
let numPlayers = numPlayersSelect.value;
numPlayersSelect.addEventListener('change', (event) => {
    numPlayers = event.target.value;
});

// Finding Grid Size
const findWidth = () => parseInt(gridSizeSelect.value.substring(0, gridSizeSelect.value.indexOf('x')));
const findHeight = () => parseInt(gridSizeSelect.value.substring(gridSizeSelect.value.indexOf('x') + 1));
let width = findWidth();
let height = findHeight();

gridSizeSelect.addEventListener('change', () => {
    width = findWidth();
    height = findHeight();
});

// Adding on-click listener to the play button
playButton.addEventListener('click', () => {
    document.getElementById("button-click").play();
    setTimeout(() => {
        window.location.href=`./game.html?width=${width}&height=${height}&numPlayers=${numPlayers}`;
    }, 500);
});

/* Adding Event Listeners for Playing Sound */
numPlayersSelect.addEventListener('mouseenter', () => {
    document.getElementById("button-hover-1").play();
});
gridSizeSelect.addEventListener('mouseenter', () => {
    document.getElementById("button-hover-2").play();
});
document.getElementsByTagName('a')[0].addEventListener('mouseenter', () => {
    document.getElementById("button-hover-3").play();
});
