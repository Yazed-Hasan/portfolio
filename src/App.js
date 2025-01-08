import React, { useState, useEffect } from 'react';
import './index.css'; // Ensure Tailwind and custom styles are imported
import './App.css';
import Navbar_ from './components/Navbar_.js';
import Portfolio from './components/Portfolio';
import AOS from 'aos'; // Import AOS
import 'aos/dist/aos.css'; // Import AOS styles

function App() {
  const [theme, setTheme] = useState('light');
  const [isMobile, setIsMobile] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme){
      setTheme(savedTheme);
      document.documentElement.classList.add(savedTheme);
    } else {
      // Default to light
      setTheme('light');
      document.documentElement.classList.add('light');
    }

    // Detect if the device is mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize AOS with animations triggering on every scroll
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      once: false,    // Changed from true to false to allow repeated animations
    });
  }, []);

  // Optional: Refresh AOS on dynamic content updates
  useEffect(() => {
    AOS.refresh();
  });

  // Toggle theme and save preference
  const toggleTheme = () => {
    if(theme === 'light'){
      setTheme('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  // Handle mouse movement for spotlight effect
  useEffect(() => {
    if(theme === 'dark' && !isMobile){
      const handleMouseMove = (e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [theme, isMobile]);

  // Update CSS variables based on mouse position
  useEffect(() => {
    if(theme === 'dark' && !isMobile){
      document.documentElement.style.setProperty('--mouse-x', `${mousePos.x}px`);
      document.documentElement.style.setProperty('--mouse-y', `${mousePos.y}px`);
    }
  }, [mousePos, theme, isMobile]);

  return (
    <div className={`App main-div ${theme}`}>
       <Navbar_ theme={theme} toggleTheme={toggleTheme} />
       <Portfolio />
       {/* Spotlight Effect */}
       {theme === 'dark' && !isMobile && (
         <div className="spotlight"></div>
       )}
    </div>
  );
}

export default App;
