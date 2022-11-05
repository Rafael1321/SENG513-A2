// Constants 
const p1Img = '../assets/images/cool.png'
const p2Img = '../assets/images/happy.png'
const p3Img = '../assets/images/happy2.png'

// Getting query parameters from URL
const params = new URLSearchParams(window.location.search);

// Setting the correct player name in the message

const messageSpan = document.getElementsByClassName('message')[0].getElementsByTagName('span')[0];
messageSpan.textContent = parseInt(params.get('playerNum')) === 0?`No one wins. It is a tie!!!`:`Player ${params.get('playerNum')} wins the game!!!`;

// Setting the correct player image/images
const imagesDiv =  document.getElementsByClassName('message')[0].getElementsByClassName('images')[0];
switch(parseInt(params.get('playerNum'))){
    case 0:
        imagesDiv.innerHTML = `<img id="img1" src="${p1Img}" alt="">`
        imagesDiv.innerHTML += `<img id="img2" src="${p2Img}" alt="">`
        imagesDiv.innerHTML += `<img id="img3" src="${p3Img}" alt="">`
        break;
    case 1:
        imagesDiv.innerHTML = `<img id="img1" src="${p1Img}" alt="">`
        break;
    case 2:
        imagesDiv.innerHTML = `<img id="img2" src="${p2Img}" alt="">`
        break;
    case 3:
        imagesDiv.innerHTML = `<img id="img3" src="${p3Img}" alt="">`
        break;
}

// For Playing Audio
document.getElementById('home').addEventListener('mouseenter', () => {
    document.getElementById('button-hover').play();
});
document.getElementById('home').addEventListener('click', () => {
    document.getElementById('button-click').play();
    setTimeout(() => {
        window.location.href=`../index.html`;
    }, 500);  
});

