const messages = ["Hello", "स्वागत हे" , "ಸ್ವಾಗತ"];
// const messages = ["Hello", "Bonjour", "स्वागत हे", "Ciao", "Olá", "おい", "Hallå", "Guten tag", "Hallo"];
const preloader = document.getElementById('preloader');
const content = document.getElementById('content');

let currentMessage = 0;

function showNextMessage() {
    if (currentMessage < messages.length) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = messages[currentMessage];

        if (currentMessage === 0) {
            messageElement.classList.add('fade-in');
        }

        preloader.innerHTML = '';
        preloader.appendChild(messageElement);

        let displayTime = 900;
        if (currentMessage === 0) {
            displayTime = 900;
        }

        currentMessage++;
        setTimeout(showNextMessage, displayTime);
    } else {
        content.classList.add('show-content');
        content.style.borderBottomLeftRadius = '0';
        content.style.borderBottomRightRadius = '0';
        
        setTimeout(() => {
            preloader.classList.add('');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 400);
        }, 400);
    }
}

window.onload = () => setTimeout(showNextMessage, 700);

function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}


 document.addEventListener('DOMContentLoaded', function() {
    // Create stars container
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars';
    document.body.appendChild(starsContainer);
    
    // Create stars
    const numberOfStars = 200;
    
    for (let i = 0; i < numberOfStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Random size between 1px and 3px
      const size = Math.random() * 2 + 1.4;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Random animation properties
      star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
      star.style.setProperty('--delay', `${Math.random() * 5}s`);
      star.style.setProperty('--opacity', `${Math.random() * 0.7 + 0.3}`);
      
      starsContainer.appendChild(star);
    }
  });