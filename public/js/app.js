document.addEventListener('DOMContentLoaded', () => {
    let currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.add(currentTheme);

    function toggleTheme() {
        const oldTheme = currentTheme;
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.remove(oldTheme);
        document.documentElement.classList.add(currentTheme);
        localStorage.setItem('theme', currentTheme);

        const themeToggleButton = document.querySelector('.theme-toggle');
        if (themeToggleButton) {
            themeToggleButton.textContent = currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
        if (currentTheme === 'dark') {
            addSpotlightEffect();
        } else {
            removeSpotlightEffect();
        }
    }

    let isMobile = window.innerWidth <= 768;
    const spotlightDiv = document.createElement('div');
    spotlightDiv.className = 'spotlight';

    function handleMouseMove(e) {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    }

    function addSpotlightEffect() {
        if (currentTheme === 'dark' && !isMobile) {
            if (!document.querySelector('.spotlight')) { 
                 const appDiv = document.querySelector('.App.main-div') || document.body;
                 appDiv.appendChild(spotlightDiv);
            }
            window.addEventListener('mousemove', handleMouseMove);
        }
    }

    function removeSpotlightEffect() {
        if (document.querySelector('.spotlight')) {
            document.querySelector('.spotlight').remove();
        }
        window.removeEventListener('mousemove', handleMouseMove);
    }
    
    window.addEventListener('resize', () => {
        const oldIsMobile = isMobile;
        isMobile = window.innerWidth <= 768;
        if (oldIsMobile !== isMobile) { 
            if (currentTheme === 'dark') {
                if (isMobile) {
                    removeSpotlightEffect();
                } else {
                    addSpotlightEffect();
                }
            }
        }
    });

    if (currentTheme === 'dark') {
        addSpotlightEffect();
    }

    if (typeof renderNavbar === 'function') {
        renderNavbar(currentTheme, toggleTheme);
    } else {
        console.error('renderNavbar function not found. Ensure navbar.js is loaded.');
    }

    if (typeof renderPortfolio === 'function') {
        renderPortfolio();
    } else {
        console.error('renderPortfolio function not found. Ensure portfolio.js is loaded.');
    }
    
    if (!document.getElementById('home')) {
        const homeSection = document.createElement('section');
        homeSection.id = 'home';
        const mainAppDiv = document.querySelector('.App.main-div');
        if (mainAppDiv) {
            mainAppDiv.insertBefore(homeSection, mainAppDiv.firstChild);
        } else {
            document.body.insertBefore(homeSection, document.body.firstChild);
        }
    }
});
