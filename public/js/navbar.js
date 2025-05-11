function renderNavbar(initialTheme, toggleThemeCallback) {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        console.error('Navbar container not found');
        return;
    }
    navbarContainer.innerHTML = '';

    const nav = document.createElement('nav');
    nav.className = 'navbar';

    const logo = document.createElement('div');
    logo.className = 'logo';
    logo.textContent = 'MyPortfolio';
    nav.appendChild(logo);

    const navLinksContainer = document.createElement('div');
    navLinksContainer.className = 'nav-links';

    const links = [
        { href: '#home', text: 'Home' },
        { href: '#about', text: 'About Me' },
        { href: '#projects', text: 'Projects' },
        { href: '#experience', text: 'Experience' },
        { href: '#skills', text: 'Skills' },
        { href: '#gallery', text: 'Gallery' },
        { href: '#contact', text: 'Contact' }
    ];

    links.forEach(linkInfo => {
        const link = document.createElement('a');
        link.href = linkInfo.href;
        link.textContent = linkInfo.text;
        link.className = 'nav-link';
        navLinksContainer.appendChild(link);
    });

    const themeToggleButton = document.createElement('button');
    themeToggleButton.className = 'theme-toggle';
    themeToggleButton.textContent = initialTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    themeToggleButton.addEventListener('click', () => {
        toggleThemeCallback(); 
    });
    navLinksContainer.appendChild(themeToggleButton);
    nav.appendChild(navLinksContainer);

    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<div class="bar"></div><div class="bar"></div><div class="bar"></div>';
    hamburger.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        hamburger.classList.toggle('change');
    });
    nav.appendChild(hamburger);

    navbarContainer.appendChild(nav);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', navLinkHighlighter);
    window.addEventListener('hashchange', navLinkHighlighter);

    function navLinkHighlighter() {
        let scrollY = window.pageYOffset;
        let activeFound = false;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 70;
            let sectionId = current.getAttribute('id');
            const navLink = document.querySelector('.nav-links a[href*=' + sectionId + ']');

            if (navLink) {
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                    activeFound = true;
                } else {
                    navLink.classList.remove('active');
                }
            }
        });

        const homeLink = document.querySelector('.nav-links a[href=\"#home\"]');
        if (homeLink) {
            if (!activeFound && scrollY < (sections[0] ? sections[0].offsetTop - 70 : window.innerHeight)) {
                homeLink.classList.add('active');
            } else if (activeFound && scrollY >= (sections[0] ? sections[0].offsetTop - 70 : window.innerHeight)) {
                homeLink.classList.remove('active');
            }
        }
    }
    setTimeout(navLinkHighlighter, 100);
}