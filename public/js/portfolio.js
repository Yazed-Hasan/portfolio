// public/js/portfolio.js
async function fetchText(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
        return ''; // Return empty string on error
    }
}

function renderPortfolio() {
    const portfolioContainer = document.getElementById('portfolio-container');
    if (!portfolioContainer) {
        console.error('Portfolio container not found');
        return;
    }
    portfolioContainer.innerHTML = ''; // Clear existing content

    const portfolioHeader = document.createElement('h1');
    portfolioHeader.className = 'portfolio-header';
    // portfolioHeader.textContent = 'Portfolio';
    portfolioContainer.appendChild(portfolioHeader);

    // --- About Me Section ---
    const aboutSection = document.createElement('section');
    aboutSection.className = 'about-section'; // Changed class name
    aboutSection.id = 'about';
    const aboutTitle = document.createElement('h2');
    aboutTitle.className = 'section-title';
    aboutTitle.textContent = 'About Me';
    aboutSection.appendChild(aboutTitle);

    const aboutMeContent = document.createElement('div'); // New container for the text
    aboutMeContent.className = 'about-me-content';

    fetchText('assets/texts/texts.txt').then(text => {
        // Join lines into a single paragraph or process as needed
        // For now, let's assume the text is a single block.
        // If texts.txt has multiple paragraphs separated by blank lines,
        // we might need to split and create multiple <p> elements.
        // For simplicity, we'll treat it as one block for now.
        const p = document.createElement('p');
        // Replace newlines in the text file with <br> for HTML rendering,
        // or split into multiple paragraphs if that's the structure.
        // Current texts.txt seems to be a single block of text.
        p.innerHTML = text.trim().replace(/\r?\n/g, '<br>'); 
        aboutMeContent.appendChild(p);
    }).catch(error => { // Added catch block for robustness
        console.error("Failed to load about me text:", error);
        const pError = document.createElement('p');
        pError.textContent = 'Could not load about me information.';
        pError.style.color = 'var(--accent-color)';
        aboutMeContent.appendChild(pError);
    });
    aboutSection.appendChild(aboutMeContent); // Append the new content container
    portfolioContainer.appendChild(aboutSection);

    // --- Projects Section ---
    const projectsSection = document.createElement('section');
    projectsSection.className = 'projects-section';
    projectsSection.id = 'projects';
    const projectsTitle = document.createElement('h2');
    projectsTitle.className = 'section-title';
    projectsTitle.textContent = 'Projects';
    projectsSection.appendChild(projectsTitle);
    const projectsContent = document.createElement('div');
    projectsContent.className = 'projects-content';
    fetchText('assets/texts/projects.txt').then(text => {
        console.log("[DEBUG] Fetched projects.txt content:\n" + text); // Log raw content
        
        const projectEntries = text.split(/\r?\n\r?\n/).filter(entry => {
            const trimmedEntry = entry.trim();
            return trimmedEntry !== '' && !trimmedEntry.startsWith('/*');
        });
        console.log("[DEBUG] Parsed projectEntries:", projectEntries); // Log entries after split and filter

        if (projectEntries.length === 0 && text.trim() !== '' && !text.trim().startsWith('/*')) {
            console.warn("[DEBUG] No project entries were parsed. This might be due to incorrect formatting in projects.txt. Ensure projects are separated by one completely blank line.");
        }

        projectEntries.forEach((projectData, index) => {
            // console.log(`[DEBUG] Processing projectData ${index + 1}:\n${projectData}`); // Log each project block
            
            // Split projectData into lines, but stop if a line starts with '/*'
            const linesFromEntry = projectData.split(/\r?\n/);
            const effectiveContentLines = [];
            for (const line of linesFromEntry) {
                if (line.trim().startsWith('/*')) {
                    break; // Stop processing lines for this project if a comment block starts
                }
                effectiveContentLines.push(line);
            }
            
            // Now, map and filter these effective lines to get clean project lines
            const projectLines = effectiveContentLines.map(line => line.trim()).filter(line => line !== '');
            // console.log(`[DEBUG] Parsed projectLines for project ${index + 1}:`, projectLines); // Log lines for this project
            
            if (projectLines.length < 3) { // Need at least Title, Description, Image
                console.warn(`[DEBUG] Project entry ${index + 1} (Data after filtering comments and empty lines: "${projectLines.join(' | ')}") is incomplete. Expected at least 3 lines (Title, Description, Image), got ${projectLines.length}. Original data block was:\n${projectData}`);
                return;
            }

            const title = projectLines[0];
            // The last line is now a comma-separated string of image filenames
            const imageNamesString = projectLines[projectLines.length - 1];
            const imageFilenames = imageNamesString.split(',').map(name => name.trim()).filter(name => name !== '');
            
            let subtitle = '';
            let descriptionLines = [];

            // Assumes Title is line 0, Image string is last line.
            // Remaining lines are Subtitle (if present) and Description.
            // Adjust slice to account for imageFilenames being the last line.
            if (projectLines.length === 3) { // Title, Description, ImageFilenames
                descriptionLines = [projectLines[1]];
            } else if (projectLines.length > 3) { // Title, Subtitle, Description..., ImageFilenames
                subtitle = projectLines[1];
                descriptionLines = projectLines.slice(2, projectLines.length - 1);
            }
            const description = descriptionLines.join('\n');

            const projectItem = document.createElement('div');
            projectItem.className = 'project-item';

            const h3 = document.createElement('h3');
            h3.textContent = title;
            projectItem.appendChild(h3);

            if (subtitle) {
                const h4 = document.createElement('h4');
                h4.textContent = subtitle;
                projectItem.appendChild(h4);
            }

            const p = document.createElement('p');
            // Convert newlines to spaces for the card display and prepare for truncation
            const cardDescriptionText = description.replace(/\n/g, ' '); 
            const maxCardDescriptionLength = 100; // Max characters for description on the card

            if (cardDescriptionText.length > maxCardDescriptionLength) {
                let snippet = cardDescriptionText.substring(0, maxCardDescriptionLength);
                // Try to break at the last space to avoid cutting words
                const lastSpaceIndex = snippet.lastIndexOf(' ');
                if (lastSpaceIndex > 0) {
                    snippet = snippet.substring(0, lastSpaceIndex);
                }
                p.textContent = snippet + '...';
            } else {
                p.textContent = cardDescriptionText;
            }
            projectItem.appendChild(p);

            // For the project card, we'll display the first image if available
            // The modal will receive all image filenames.
            let firstImageSrcForCard = null; 
            const allImageSourcesForModal = [];
            let imageElement = null; // Declare imageElement here to ensure it's in scope

            if (imageFilenames.length > 0) {
                const firstImageName = imageFilenames[0];
                firstImageSrcForCard = `assets/images/${firstImageName}`;

                imageFilenames.forEach(imageName => {
                    allImageSourcesForModal.push(`assets/images/${imageName}`);
                });

                imageElement = document.createElement('img'); // Assign here
                imageElement.src = firstImageSrcForCard;
                imageElement.alt = title + " - primary image";
                imageElement.className = 'project-image';
                imageElement.loading = 'lazy';
                imageElement.onerror = function() {
                    console.error(`Failed to load primary image for card: ${imageElement.src}.`);
                };
                
                // Add click event listener for image modal (for the first image on the card)
                imageElement.addEventListener('click', function(event) {
                    event.stopPropagation(); 
                    createImageModal(this.src, this.alt);
                });
                projectItem.appendChild(imageElement);
            } else {
                const pNoImage = document.createElement('p');
                pNoImage.textContent = 'No images specified for this project.';
                projectItem.appendChild(pNoImage);
            }

            // Add click listener to the entire project item for the project detail modal
            projectItem.addEventListener('click', (event) => {
                // Check if the click target is the project image itself or a child of it.
                // If so, the image's own click listener (for createImageModal) should handle it.
                if (imageElement && (event.target === imageElement || imageElement.contains(event.target))) {
                    return; // Do not open project detail modal if the project image was clicked.
                }
                createProjectDetailModal(title, subtitle, description, allImageSourcesForModal, title);
            });

            projectsContent.appendChild(projectItem);
        });
    });
    projectsSection.appendChild(projectsContent);
    portfolioContainer.appendChild(projectsSection);

    // --- Experience Section ---
    const experienceSection = document.createElement('section');
    experienceSection.className = 'experience-section';
    experienceSection.id = 'experience';
    const experienceTitle = document.createElement('h2');
    experienceTitle.className = 'section-title';
    experienceTitle.textContent = 'Work Experience';
    experienceSection.appendChild(experienceTitle);
    const experienceContent = document.createElement('div');
    experienceContent.className = 'experience-content';

    fetchText('assets/texts/experience.txt').then(text => {
        const experienceEntries = text.split(/\r?\n\r?\n/).filter(entry => {
            const trimmedEntry = entry.trim();
            return trimmedEntry !== '' && !trimmedEntry.startsWith('/*');
        });

        experienceEntries.forEach(entryData => {
            const lines = entryData.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '' && !line.startsWith('//'));
            
            if (lines.length < 3) { // Title, Company | Location, Date are minimum
                return; // Silently skip incomplete entries
            }

            const experienceItem = document.createElement('div');
            experienceItem.className = 'experience-item';

            const jobTitle = document.createElement('h3');
            jobTitle.textContent = lines[0];
            experienceItem.appendChild(jobTitle);

            const companyInfo = document.createElement('h4');
            companyInfo.textContent = lines[1];
            experienceItem.appendChild(companyInfo);

            const dateInfo = document.createElement('p');
            dateInfo.className = 'date';
            dateInfo.textContent = lines[2];
            experienceItem.appendChild(dateInfo);

            if (lines.length > 3) {
                const responsibilitiesList = document.createElement('ul');
                for (let i = 3; i < lines.length; i++) {
                    const line = lines[i]; 
                    if (line.startsWith('-')) {
                        const currentLi = document.createElement('li');
                        let textForLi = line.substring(1).trim(); 

                        let j = i + 1;
                        while (j < lines.length && !lines[j].startsWith('-')) {
                            const continuationLine = lines[j].trim(); 
                            if (continuationLine) { 
                                textForLi += '<br>' + continuationLine;
                            }
                            j++;
                        }
                        currentLi.innerHTML = textForLi; 
                        responsibilitiesList.appendChild(currentLi);
                        i = j - 1; 
                    }
                }
                experienceItem.appendChild(responsibilitiesList);
            }
            experienceContent.appendChild(experienceItem);
        });
    }).catch(error => {
        console.error("Failed to load experience.txt:", error);
        const pError = document.createElement('p');
        pError.textContent = 'Could not load work experience.';
        pError.style.color = 'var(--accent-color)';
        experienceContent.appendChild(pError);
    });
    experienceSection.appendChild(experienceContent);
    portfolioContainer.appendChild(experienceSection); // Add before Skills


      // --- Images Section (Gallery) ---
    const imagesSection = document.createElement('section');
    imagesSection.className = 'images-section';
    imagesSection.id = 'gallery';
    const imagesTitle = document.createElement('h2');
    imagesTitle.className = 'section-title';
    imagesTitle.textContent = 'Gallery';
    imagesSection.appendChild(imagesTitle);

    const imagesPreviewContent = document.createElement('div');
    imagesPreviewContent.className = 'images-content-preview'; // Class for the preview area

    // Create a container for the preview images themselves
    const previewThumbnailsContainer = document.createElement('div');
    previewThumbnailsContainer.className = 'preview-thumbnails-container';
    imagesPreviewContent.appendChild(previewThumbnailsContainer);

    // Add a button to open the full gallery modal
    const openGalleryButton = document.createElement('button');
    openGalleryButton.className = 'open-gallery-button btn btn-primary'; 
    openGalleryButton.textContent = 'View Full Gallery';
    openGalleryButton.onclick = () => createFullGalleryModal();
    // Button will be appended after images or if no images, see below

    const galleryLoadingIndicator = document.createElement('p');
    galleryLoadingIndicator.className = 'loading-indicator';
    galleryLoadingIndicator.textContent = 'Loading gallery preview...';
    previewThumbnailsContainer.appendChild(galleryLoadingIndicator); // Show loading in the thumbnails area

    fetchText('assets/texts/gallery.txt').then(text => {
        galleryLoadingIndicator.remove();
        const allImageFilenames = text.split(/\r?\n/).map(name => name.trim()).filter(name => name !== '' && !name.startsWith('#'));
        const numberOfPreviewImages = 4; // Show up to 4 preview images
        const previewImageFilenames = allImageFilenames.slice(0, numberOfPreviewImages);

        if (previewImageFilenames.length > 0) {
            previewImageFilenames.forEach((filename, index) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'gallery-image-container preview-image-item'; // Added class for specific preview item styling

                const img = document.createElement('img');
                img.src = `assets/images/${filename}`;
                img.alt = `Gallery preview ${index + 1} - ${filename}`;
                img.className = 'portfolio-image gallery-image';
                img.loading = 'lazy';
                img.onerror = function() {
                    console.error(`Failed to load gallery preview image: ${img.src}.`);
                    imgContainer.innerHTML = `<p class="gallery-image-error">Error loading ${filename}</p>`;
                };

                img.addEventListener('click', function() {
                    createImageModal(this.src, this.alt); // Opens individual image zoom modal
                });

                imgContainer.appendChild(img);
                previewThumbnailsContainer.appendChild(imgContainer);
            });
            imagesPreviewContent.appendChild(openGalleryButton); // Add button after previews
        } else if (allImageFilenames.length > 0) {
            // This case means there are images in gallery.txt, but slice resulted in 0 (e.g. numberOfPreviewImages = 0)
            // Or simply, if there are images, always show the button
            imagesPreviewContent.appendChild(openGalleryButton);
            const pNoPreviews = document.createElement('p');
            pNoPreviews.textContent = 'Click "View Full Gallery" to see all images.';
            pNoPreviews.style.textAlign = 'center';
            previewThumbnailsContainer.appendChild(pNoPreviews); 
        } else {
            const pNoImages = document.createElement('p');
            pNoImages.textContent = 'No images in the gallery yet. Add images to assets/texts/gallery.txt.';
            pNoImages.style.textAlign = 'center';
            previewThumbnailsContainer.appendChild(pNoImages);
            // Optionally hide or disable the button if there are truly no images
            openGalleryButton.style.display = 'none'; 
        }
        // Ensure button is appended if not already (e.g. if previewImageFilenames was empty but allImageFilenames was not)
        if (!imagesPreviewContent.contains(openGalleryButton) && allImageFilenames.length > 0) {
             imagesPreviewContent.appendChild(openGalleryButton);
        }

    }).catch(error => {
        galleryLoadingIndicator.remove();
        console.error("Failed to load gallery.txt for preview:", error);
        const pError = document.createElement('p');
        pError.textContent = 'Could not load gallery preview.';
        pError.style.textAlign = 'center';
        pError.style.color = 'var(--accent-color)';
        previewThumbnailsContainer.appendChild(pError);
        openGalleryButton.style.display = 'none'; // Hide button on error
    });

    imagesSection.appendChild(imagesPreviewContent);
    portfolioContainer.appendChild(imagesSection);
    // --- Skills Section ---
    const skillsSection = document.createElement('section');
    skillsSection.className = 'skills-section';
    skillsSection.id = 'skills';
    const skillsTitle = document.createElement('h2');
    skillsTitle.className = 'section-title';
    skillsTitle.textContent = 'Skills';
    skillsSection.appendChild(skillsTitle);

    const skillsContentContainer = document.createElement('div');
    skillsContentContainer.className = 'skills-content-container';

    fetchText('assets/texts/skills.txt').then(text => {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '' && !line.startsWith('//'));

        let standaloneSkillsDiv = null;
        let standaloneSkillsList = null;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.includes(':')) {
                const parts = trimmedLine.split(':', 2);
                const categoryName = parts[0].trim();
                const subSkillsString = parts[1].trim();
                
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'skill-category';

                const categoryTitleElement = document.createElement('h4');
                categoryTitleElement.className = 'skill-category-title';
                categoryTitleElement.textContent = categoryName;
                categoryDiv.appendChild(categoryTitleElement);

                const subSkillsUl = document.createElement('ul');
                subSkillsUl.className = 'skill-list skill-subcategory-list';
                
                subSkillsString.split(',').forEach(subSkill => {
                    const subSkillTrimmed = subSkill.trim();
                    if (subSkillTrimmed) {
                        const li = document.createElement('li');
                        li.className = 'skill-item';
                        li.textContent = subSkillTrimmed;
                        subSkillsUl.appendChild(li);
                    }
                });
                categoryDiv.appendChild(subSkillsUl);
                skillsContentContainer.appendChild(categoryDiv);
            } else {
                if (!standaloneSkillsDiv) {
                    standaloneSkillsDiv = document.createElement('div');
                    standaloneSkillsDiv.className = 'skill-category standalone-skills-category';

                    const standaloneCategoryTitle = document.createElement('h4');
                    standaloneCategoryTitle.className = 'skill-category-title';
                    standaloneCategoryTitle.textContent = 'Technical Proficiencies';
                    standaloneSkillsDiv.appendChild(standaloneCategoryTitle);

                    standaloneSkillsList = document.createElement('ul');
                    standaloneSkillsList.className = 'skill-list';
                    standaloneSkillsDiv.appendChild(standaloneSkillsList);
                    skillsContentContainer.appendChild(standaloneSkillsDiv);
                }
                const li = document.createElement('li');
                li.className = 'skill-item';
                li.textContent = trimmedLine;
                standaloneSkillsList.appendChild(li);
            }
        });
    }).catch(error => {
        console.error("Failed to load skills.txt:", error);
        const pError = document.createElement('p');
        pError.textContent = 'Could not load skills.';
        pError.style.color = 'var(--accent-color)';
        skillsContentContainer.appendChild(pError);
    });

    skillsSection.appendChild(skillsContentContainer);
    portfolioContainer.appendChild(skillsSection);

  

    // --- Contact Section ---
    const contactSection = document.createElement('section');
    contactSection.className = 'contact-section';
    contactSection.id = 'contact';
    const contactTitle = document.createElement('h2');
    contactTitle.className = 'section-title';
    contactTitle.textContent = 'Contact';
    contactSection.appendChild(contactTitle);
    const contactGrid = document.createElement('div');
    contactGrid.className = 'contact-grid';

    const iconMap = {
        email: 'fas fa-envelope',
        linkedin: 'fab fa-linkedin',
        github: 'fab fa-github',
        phone: 'fas fa-phone',
        itchio: 'fab fa-itch-io', 
        website: 'fas fa-globe',
        twitter: 'fab fa-twitter',
        instagram: 'fab fa-instagram',
        facebook: 'fab fa-facebook'
    };
    const defaultIcon = 'fas fa-info-circle';

    fetchText('assets/texts/contact.txt').then(text => {
        text.split(/\r?\n/).forEach(line => {
            if (line.trim() === '' || line.startsWith('//')) return;

            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';

            const iconSpan = document.createElement('span');
            iconSpan.className = 'contact-icon';

            let linkTextContent = line;
            let url = '#';
            let isLink = false;
            let contactType = 'unknown';

            if (line.includes(':')) {
                const parts = line.split(': ');
                contactType = parts[0].toLowerCase().replace(/[^a-z0-9]/gi, ''); 
                const value = parts.slice(1).join(': ');
                linkTextContent = value;

                iconSpan.innerHTML = `<i class="${iconMap[contactType] || defaultIcon}"></i>`;

                if (contactType === 'email') {
                    url = `mailto:${value}`; 
                    isLink = true;
                } else if (contactType === 'phone') {
                    url = `tel:${value.replace(/\s+/g, '')}`; 
                    isLink = true;
                } else if (value.startsWith('http') || value.startsWith('www')) {
                    url = value.startsWith('http') ? value : `https://${value}`;
                    isLink = true;
                } else {
                    linkTextContent = line; 
                    isLink = false; 
                }
            } else {
                iconSpan.innerHTML = `<i class="${defaultIcon}"></i>`;
            }

            contactItem.appendChild(iconSpan);

            if (isLink) {
                const a = document.createElement('a');
                a.href = url;
                a.textContent = linkTextContent;
                if (!url.startsWith('mailto:') && !url.startsWith('tel:')) {
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                }
                contactItem.appendChild(a);
            } else {
                const p = document.createElement('p');
                p.textContent = linkTextContent;
                contactItem.appendChild(p);
            }
            contactGrid.appendChild(contactItem);
        });
    });
    contactSection.appendChild(contactGrid);
    portfolioContainer.appendChild(contactSection);
}

// Function to create and display the image modal
function createImageModal(src, alt) {
    console.log('[createImageModal] Called with src:', src); // Log entry and src

    // Check if a modal already exists and remove it
    const existingModal = document.getElementById('image-modal-overlay');
    if (existingModal) {
        console.log('[createImageModal] Found existing modal, attempting to remove.');
        if (typeof existingModal.closeModalCleanup === 'function') {
            existingModal.closeModalCleanup();
        } else {
            existingModal.remove();
        }
    }

    let currentScale = 1.0;
    const scaleStep = 0.1;
    let translateX = 0;
    let translateY = 0;
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    const smoothingFactor = 0.2; // Adjust for more (smaller value) or less (larger value closer to 1) smoothing

    // Create modal overlay first, as cleanup function needs to reference it.
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'image-modal-overlay';
    modalOverlay.className = 'image-modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'image-modal-content';

    const modalImage = document.createElement('img');
    modalImage.src = src;
    modalImage.alt = alt;
    modalImage.className = 'image-modal-image';
    modalImage.style.transformOrigin = 'center center';
    modalImage.style.cursor = 'grab';

    // --- Helper Functions & Event Handlers (defined before use) ---
    function applyTransform() {
        modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }

    function applyZoom() {
        applyTransform();
    }

    function zoomIn() {
        currentScale += scaleStep;
        applyZoom();
    }

    function zoomOut() {
        currentScale = Math.max(0.1, currentScale - scaleStep);
        applyZoom();
    }

    function resetZoom() {
        currentScale = 1.0;
        translateX = 0;
        translateY = 0;
        applyTransform();
    }

    const wheelHandler = function(event) {
        event.preventDefault();
        const rect = modalImage.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const oldScale = currentScale;

        if (event.deltaY < 0) {
            currentScale += scaleStep;
        } else {
            currentScale = Math.max(0.1, currentScale - scaleStep);
        }

        translateX -= (mouseX - rect.width / 2) * (currentScale / oldScale - 1);
        translateY -= (mouseY - rect.height / 2) * (currentScale / oldScale - 1);
        applyTransform();
    };

    const imageMouseDownHandler = function(event) {
        if (currentScale <= 1) return;
        event.preventDefault();
        isPanning = true;
        // Initialize startX and startY relative to the current translateX/Y
        // for direct manipulation feel at the start of the drag.
        // The smoothing will apply to subsequent movements.
        startX = event.clientX - translateX; 
        startY = event.clientY - translateY;
        modalImage.style.cursor = 'grabbing';
    };

    const documentMouseMoveHandler = function(event) {
        if (!isPanning) return;
        event.preventDefault();

        const targetX = event.clientX - startX;
        const targetY = event.clientY - startY;

        // Apply smoothing: move part of the way to the target
        translateX += (targetX - translateX) * smoothingFactor;
        translateY += (targetY - translateY) * smoothingFactor;

        applyTransform();
    };

    const documentMouseUpHandler = function() {
        if (isPanning) {
            isPanning = false;
            modalImage.style.cursor = 'grab';
        }
    };

    const contentMouseLeaveHandler = function() {
        if (isPanning) {
            isPanning = false;
            modalImage.style.cursor = 'grab';
        }
    };
    
    // Keyboard zoom handler (placeholder, ensure it is defined if used)
    // const handleKeyboardZoom = function(event) { ... };

    // Centralized cleanup function
    const closeModalCleanup = function() {
        modalImage.removeEventListener('wheel', wheelHandler);
        modalImage.removeEventListener('mousedown', imageMouseDownHandler);
        modalContent.removeEventListener('mouseleave', contentMouseLeaveHandler);
        document.removeEventListener('mousemove', documentMouseMoveHandler);
        document.removeEventListener('mouseup', documentMouseUpHandler);

        // Conditionally remove keyboard listener if it was added
        // if (typeof handleKeyboardZoom === 'function') { // Assuming handleKeyboardZoom might be added elsewhere or conditionally
        //     document.removeEventListener('keydown', handleKeyboardZoom);
        // }

        if (modalOverlay.parentNode) {
            modalOverlay.remove();
        }
    };
    // Store cleanup function on the overlay for potential external call (defensive)
    modalOverlay.closeModalCleanup = closeModalCleanup; 


    // --- Create and Setup DOM Elements ---
    const closeButton = document.createElement('span');
    closeButton.className = 'image-modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = closeModalCleanup;

    const zoomInButton = document.createElement('button');
    zoomInButton.className = 'image-modal-zoom image-modal-zoom-in';
    zoomInButton.innerHTML = '&#43;';
    zoomInButton.title = 'Zoom In (+)';
    zoomInButton.onclick = zoomIn;

    const zoomOutButton = document.createElement('button');
    zoomOutButton.className = 'image-modal-zoom image-modal-zoom-out';
    zoomOutButton.innerHTML = '&#8722;';
    zoomOutButton.title = 'Zoom Out (-)';
    zoomOutButton.onclick = zoomOut;
    
    const resetZoomButton = document.createElement('button');
    resetZoomButton.className = 'image-modal-zoom image-modal-zoom-reset';
    resetZoomButton.innerHTML = '&#x21BA;';
    resetZoomButton.title = 'Reset Zoom';
    resetZoomButton.onclick = resetZoom;

    // --- Attach Event Listeners ---
    modalImage.addEventListener('wheel', wheelHandler);
    modalImage.addEventListener('mousedown', imageMouseDownHandler);
    modalContent.addEventListener('mouseleave', contentMouseLeaveHandler); 

    // Close modal if overlay is clicked (but not on content)
    modalOverlay.onclick = function(event) {
        if (event.target === modalOverlay) {
            closeModalCleanup();
        }
    };

    // Append elements to their parents
    modalContent.appendChild(modalImage);
    modalContent.appendChild(zoomInButton);
    modalContent.appendChild(zoomOutButton);
    modalContent.appendChild(resetZoomButton);

    modalOverlay.appendChild(closeButton); // Close button is a direct child of overlay
    modalOverlay.appendChild(modalContent);
    
    console.log('[createImageModal] Appending modalOverlay to body. ID:', modalOverlay.id, 'Class:', modalOverlay.className);
    document.body.appendChild(modalOverlay);
    console.log('[createImageModal] ModalOverlay parent after append:', modalOverlay.parentNode ? modalOverlay.parentNode.tagName : 'null');
    if (modalOverlay.parentNode !== document.body) {
        console.error("[createImageModal] Modal overlay was NOT successfully appended to document.body!");
    }
    console.log('[createImageModal] Computed style before active - display:', window.getComputedStyle(modalOverlay).display, 'opacity:', window.getComputedStyle(modalOverlay).opacity, 'visibility:', window.getComputedStyle(modalOverlay).visibility);


    // Attach global listeners (must be done after modal is in DOM for some scenarios, but generally fine here)
    document.addEventListener('mousemove', documentMouseMoveHandler);
    document.addEventListener('mouseup', documentMouseUpHandler);
    // if (typeof handleKeyboardZoom === 'function') { // Conditionally add keyboard listener
    //     document.addEventListener('keydown', handleKeyboardZoom);
    // }

    // --- Show Modal ---
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modalOverlay.classList.add('active');
            console.log('[createImageModal] Added "active" class. Current classes:', modalOverlay.classList.toString());
            const stylesAfterActive = window.getComputedStyle(modalOverlay);
            console.log('[createImageModal] Computed style after active - display:', stylesAfterActive.display, 'opacity:', stylesAfterActive.opacity, 'visibility:', stylesAfterActive.visibility);
            if (modalOverlay.parentNode !== document.body) {
                console.error("[createImageModal] Modal overlay was removed from DOM before it could become active!");
            }
            if (stylesAfterActive.display === 'none' && modalOverlay.classList.contains('active')) {
                console.warn("[createImageModal] Modal overlay display is 'none' despite 'active' class. Check CSS for .image-modal-overlay and .image-modal-overlay.active");
            }
            if (parseFloat(stylesAfterActive.opacity) === 0 && modalOverlay.classList.contains('active') && stylesAfterActive.visibility === 'visible') {
                console.warn("[createImageModal] Modal overlay opacity is 0 but visibility is visible. Check for conflicting opacity styles or transition issues.");
            }
             if (parseFloat(stylesAfterActive.opacity) === 0 && modalOverlay.classList.contains('active')) {
                console.warn("[createImageModal] Modal overlay opacity is STILL 0 after adding 'active' class. Please check CSS specificity, !important flags, or try a hard browser refresh (Ctrl+F5).");
            }
        });
    });
}

// Function to create and display the project detail modal
function createProjectDetailModal(title, subtitle, description, imageSrcs, imageBaseAlt) { // Changed imageSrc to imageSrcs
    console.log('[createProjectDetailModal] Called with title:', title); // Log entry

    // Check if a modal already exists and remove it
    const existingModal = document.getElementById('project-detail-modal-overlay');
    if (existingModal) {
        console.log('[createProjectDetailModal] Found existing project detail modal, removing.');
        existingModal.remove();
    }

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'project-detail-modal-overlay'; // Unique ID for project modal
    modalOverlay.className = 'image-modal-overlay'; // Can reuse some styling

    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'project-detail-modal-content'; // Specific class for project content

    // Create title element
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'project-detail-modal-title';
    modalTitle.textContent = title;
    modalContent.appendChild(modalTitle);

    // Create subtitle element (if subtitle exists)
    if (subtitle) {
        const modalSubtitle = document.createElement('h4');
        modalSubtitle.className = 'project-detail-modal-subtitle';
        modalSubtitle.textContent = subtitle;
        modalContent.appendChild(modalSubtitle);
    }

    // Create description element with Read More functionality
    const modalDescription = document.createElement('p');
    modalDescription.className = 'project-detail-modal-description';
    
    const fullDescriptionHtml = description.replace(/\n/g, '<br>');
    const shortDescriptionLength = 200; // Max characters for the snippet

    if (description.length > shortDescriptionLength) {
        // Create snippet. Find a space near shortDescriptionLength to avoid cutting words.
        let snippet = description.substring(0, shortDescriptionLength);
        const lastSpace = snippet.lastIndexOf(' ');
        if (lastSpace > 0) {
            snippet = snippet.substring(0, lastSpace);
        }
        snippet += '...';
        modalDescription.innerHTML = snippet.replace(/\n/g, '<br>');

        const readMoreLink = document.createElement('a');
        readMoreLink.href = '#';
        readMoreLink.textContent = 'Read more';
        readMoreLink.className = 'read-more-link';
        readMoreLink.onclick = function(e) {
            e.preventDefault();
            modalDescription.innerHTML = fullDescriptionHtml;
            this.remove(); // Remove the "Read more" link
        };
        modalContent.appendChild(modalDescription);
        modalContent.appendChild(readMoreLink);
    } else {
        modalDescription.innerHTML = fullDescriptionHtml;
        modalContent.appendChild(modalDescription);
    }

    // Create image elements for the modal (if imageSrcs exist and is an array)
    if (imageSrcs && Array.isArray(imageSrcs) && imageSrcs.length > 0) {
        const imageContainer = document.createElement('div'); // Optional: container for images
        imageContainer.className = 'project-detail-modal-image-container';

        imageSrcs.forEach((src, index) => {
            const modalImage = document.createElement('img');
            modalImage.src = src;
            modalImage.alt = `${imageBaseAlt} - image ${index + 1}`;
            modalImage.className = 'project-detail-modal-image';
            modalImage.loading = 'lazy';
            modalImage.onerror = function() {
                console.error(`Failed to load project detail image: ${modalImage.src}`);
                // Optionally display a placeholder or error message for this specific image
            };
            // Make each image in the modal clickable to open the image zoom modal
            modalImage.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent modal from closing if image is part of content
                createImageModal(this.src, this.alt);
            });
            imageContainer.appendChild(modalImage);
        });
        modalContent.appendChild(imageContainer);
    }
    // Create close button
    const closeButton = document.createElement('span');
    closeButton.className = 'image-modal-close'; // Can reuse close button styling
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function() {
        modalOverlay.remove();
    };

    // Close modal if overlay is clicked
    modalOverlay.onclick = function(event) {
        if (event.target === modalOverlay) {
            modalOverlay.remove();
        }
    };

    modalContent.appendChild(closeButton); // Add close button to content
    modalOverlay.appendChild(modalContent);

    console.log('[createProjectDetailModal] Appending modalOverlay to body. ID:', modalOverlay.id, 'Class:', modalOverlay.className);
    document.body.appendChild(modalOverlay);
    console.log('[createProjectDetailModal] ModalOverlay parent after append:', modalOverlay.parentNode ? modalOverlay.parentNode.tagName : 'null');
     if (modalOverlay.parentNode !== document.body) {
        console.error("[createProjectDetailModal] Modal overlay was NOT successfully appended to document.body!");
    }
    console.log('[createProjectDetailModal] Computed style before active - display:', window.getComputedStyle(modalOverlay).display, 'opacity:', window.getComputedStyle(modalOverlay).opacity);

    // Trigger the display with a slight delay to allow CSS transition
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modalOverlay.classList.add('active');
            console.log('[createProjectDetailModal] Added "active" class. Current classes:', modalOverlay.classList.toString());
            console.log('[createProjectDetailModal] Computed style after active - display:', window.getComputedStyle(modalOverlay).display, 'opacity:', window.getComputedStyle(modalOverlay).opacity);
            if (modalOverlay.parentNode !== document.body) {
                console.error("[createProjectDetailModal] Modal overlay was removed from DOM before it could become active!");
            }
            if (window.getComputedStyle(modalOverlay).display === 'none' && modalOverlay.classList.contains('active')) {
                console.warn("[createProjectDetailModal] Modal overlay display is 'none' despite 'active' class. Check CSS for .image-modal-overlay and .image-modal-overlay.active (for project detail modal)");
            }
        });
    });
}

// NEW: Function to create and display the FULL gallery modal
function createFullGalleryModal() {
    console.log('[createFullGalleryModal] Called');

    const existingModal = document.getElementById('full-gallery-modal-overlay');
    if (existingModal) {
        existingModal.remove(); // Remove if already exists
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'full-gallery-modal-overlay';
    modalOverlay.className = 'full-gallery-modal-overlay image-modal-overlay'; // Re-use some styling

    const modalDialog = document.createElement('div');
    modalDialog.className = 'full-gallery-modal-dialog';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'full-gallery-modal-header';
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Photo Gallery';
    modalHeader.appendChild(modalTitle);

    const closeButton = document.createElement('span');
    closeButton.className = 'image-modal-close full-gallery-modal-close'; // Re-use styling
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => modalOverlay.remove();
    modalHeader.appendChild(closeButton);

    const modalBody = document.createElement('div');
    modalBody.className = 'full-gallery-modal-body images-content'; // Re-use .images-content for grid

    const loadingIndicator = document.createElement('p');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.textContent = 'Loading all images...';
    modalBody.appendChild(loadingIndicator);

    fetchText('assets/texts/gallery.txt').then(text => {
        loadingIndicator.remove();
        const imageFilenames = text.split(/\r?\n/).map(name => name.trim()).filter(name => name !== '' && !name.startsWith('#'));

        if (imageFilenames.length === 0) {
            const pNoImages = document.createElement('p');
            pNoImages.textContent = 'No images in the gallery.';
            modalBody.appendChild(pNoImages);
            return;
        }

        imageFilenames.forEach((filename, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'gallery-image-container';

            const img = document.createElement('img');
            img.src = `assets/images/${filename}`;
            img.alt = `Gallery image ${index + 1} - ${filename}`;
            img.className = 'portfolio-image gallery-image';
            img.loading = 'lazy';
            img.onerror = function() {
                console.error(`Failed to load gallery image in full modal: ${img.src}.`);
                imgContainer.innerHTML = `<p class="gallery-image-error">Error loading ${filename}</p>`;
            };

            img.addEventListener('click', function() {
                createImageModal(this.src, this.alt); // This opens the individual image zoom modal
            });

            imgContainer.appendChild(img);
            modalBody.appendChild(imgContainer);
        });
    }).catch(error => {
        loadingIndicator.remove();
        console.error("Failed to load gallery.txt for full gallery modal:", error);
        const pError = document.createElement('p');
        pError.textContent = 'Could not load gallery images.';
        pError.style.color = 'var(--accent-color)';
        modalBody.appendChild(pError);
    });

    modalDialog.appendChild(modalHeader);
    modalDialog.appendChild(modalBody);
    modalOverlay.appendChild(modalDialog);

    // Close modal if overlay backdrop is clicked
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            modalOverlay.remove();
        }
    });

    document.body.appendChild(modalOverlay);
    requestAnimationFrame(() => {
        modalOverlay.classList.add('active');
    });
}

// Function to initialize the application (if you have one, e.g., app.js calls this)
// function initApp() { ... renderPortfolio(); ... }
// Make sure renderPortfolio is called, for example, on DOMContentLoaded
if (document.readyState === 'loading') {  // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', renderPortfolio);
} else {  // `DOMContentLoaded` has already fired
    renderPortfolio();
}
