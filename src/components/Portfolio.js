import React, { useState, useEffect, useRef } from 'react';
import './Portfolio.css'; // Import CSS for Portfolio component
import AOS from 'aos';

const Portfolio = () => {
    const [texts, setTexts] = useState({});
    const [images, setImages] = useState([]);
    const sectionsRef = useRef([]);

    useEffect(() => {
        const importTexts = async () => {
            const sections = ['texts', 'projects', 'skills', 'contact'];
            const textFiles = {};

            for (let section of sections) {
                try {
                    // Absolute path 
                    const response = await fetch(`/assets/texts/${section}.txt`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${section}.txt`);
                    }
                    const data = await response.text();
                    textFiles[section] = data;
                } catch (error) {
                    console.error(`Error loading ${section}.txt:`, error);
                    textFiles[section] = '';
                }
            }

            setTexts(textFiles);
            console.log('Texts Loaded:', textFiles); 
        };

        const importImages = () => {
            const imageFilenames = [
                'project1.png',
                'project2.png',
                'project3.png',
            ];
            const imageUrls = imageFilenames.map(filename => `/assets/images/${filename}`);
            setImages(imageUrls);
            console.log('Images Loaded:', imageUrls); // Debugging
        };

        importTexts();
        importImages();

        // Refresh AOS after content is loaded
        AOS.refresh();
    }, []);

    return (
        <div className="portfolio-container">
            <h1 className="portfolio-header" data-aos="fade-down">Portfolio</h1>
            
            <section className="texts-section" ref={el => sectionsRef.current[0] = el} data-aos="fade-right">
                <h2 className="section-title">About Me</h2>
                {texts.texts && texts.texts.split('\n').map((text, index) => (
                    <p key={index} className="portfolio-text" data-aos="fade-up">{text}</p>
                ))}
            </section>
            
            <section className="projects-section" id="projects" ref={el => sectionsRef.current[1] = el} data-aos="fade-left">
                <h2 className="section-title">Projects</h2>
                <div className="projects-content">
                    {texts.projects && texts.projects.split(/\r?\n\r?\n/).map((project, index) => {
                        
                        const projectLines = project.split('\n');
                        console.log(`Parsing project ${index + 1}:`, projectLines);
                        if (projectLines.length < 4) {
                            console.warn(`Project entry ${index + 1} is incomplete.`);
                            return null;
                        }
                        const [title, subtitle, description, imagePath] = projectLines;
                        const projectImage = `/assets/images/${imagePath}`;
                        return (
                            <div className="project-item" key={index} data-aos="zoom-in">
                                <h3>{title}</h3>
                                <h4>{subtitle}</h4>
                                <p>{description}</p>
                                {imagePath ? (
                                    <img src={projectImage} alt={title} className="project-image" />
                                ) : (
                                    <p>Image not found: {imagePath}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
            
            <section className="skills-section" id="skills" ref={el => sectionsRef.current[2] = el} data-aos="fade-right">
                <h2 className="section-title">Skills</h2>
                <ul className="skills-list">
                    {texts.skills && texts.skills.split('\n').map((skill, index) => (
                        <li key={index} data-aos="fade-up">{skill}</li>
                    ))}
                </ul>
            </section>
            
            <section className="images-section" ref={el => sectionsRef.current[3] = el} data-aos="fade-left">
                <h2 className="section-title">Images</h2>
                <div className="images-content">
                    {images.map((image, index) => (
                        <img key={index} src={image} alt={`Portfolio ${index}`} className="portfolio-image" loading="lazy" data-aos="zoom-in" />
                    ))}
                </div>
            </section>
            
            <section className="contact-section" id="contact" ref={el => sectionsRef.current[4] = el} data-aos="fade-up">
                <h2 className="section-title">Contact</h2>
                {texts.contact && texts.contact.split('\n').map((line, index) => (
                    <p key={index} data-aos="fade-up">
                        {line.includes('http') ? (
                            <a href={line.split(': ')[1]} target="_blank" rel="noopener noreferrer">{line.split(': ')[0]}</a>
                        ) : (
                            line
                        )}
                    </p>
                ))}
            </section>
        </div>
    );
};

export default Portfolio;