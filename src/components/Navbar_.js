import React, { useState, useEffect, useRef } from 'react';
import './Navbar_.css';

const Navbar_ = ({ theme, toggleTheme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const sectionRefs = useRef({});

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleScroll = () => {
        const offset = window.scrollY;
        if (offset > 50) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const sections = document.querySelectorAll('section');
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    document.querySelectorAll('.nav-links a').forEach((link) => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, options);

        sections.forEach((section) => {
            observer.observe(section);
        });

        return () => {
            sections.forEach((section) => {
                observer.unobserve(section);
            });
        };
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} data-aos="fade-down">
            <div className="logo">MyApp</div>
            <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                <a href="#home" className="nav-link" data-aos="fade-right">Home</a>
                <a href="#portfolio" className="nav-link" data-aos="fade-right">Portfolio</a>
                <a href="#projects" className="nav-link" data-aos="fade-right">Projects</a>
                <a href="#skills" className="nav-link" data-aos="fade-right">Skills</a>
                <a href="#contact" className="nav-link" data-aos="fade-right">Contact</a>
                <button onClick={toggleTheme} className="theme-toggle" data-aos="fade-right">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
            <div className={`hamburger ${isOpen ? 'change' : ''}`} onClick={toggleMenu} data-aos="fade-right">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>
        </nav>
    );
};

export default Navbar_;