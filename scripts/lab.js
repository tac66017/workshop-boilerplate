let audienceData = null;
        let chaptersData = null;

        // Fetch audience data from API
        async function fetchAudienceData() {
            try {
                const response = await fetch('https://main--aem-forms-lab--jalagari.aem.live/lab/audience.json');
                const data = await response.json();
                audienceData = data.data;
                console.log('Audience data loaded:', audienceData.length, 'records');
            } catch (error) {
                console.error('Error fetching audience data:', error);
                audienceData = [];
            }
        }

        // Fetch chapters data from API
        async function fetchChaptersData() {
            try {
                const response = await fetch('https://main--aem-forms-lab--jalagari.aem.live/lab/audience.json?sheet=chapter');
                const data = await response.json();
                chaptersData = data.data;
                console.log('Chapters data loaded:', chaptersData.length, 'records');
                populateChaptersSection();
            } catch (error) {
                console.error('Error fetching chapters data:', error);
                chaptersData = [];
            }
        }

        function submitLdap() {
            const ldapInput = document.getElementById('ldapInput');
            const welcomeMessage = document.getElementById('welcomeMessage');
            const userDetails = document.getElementById('userDetails');
            const welcomeText = document.getElementById('welcomeText');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const suggestionsContainer = document.getElementById('userSuggestions');
            
            const ldap = ldapInput.value.trim();
            
            if (ldap === '') {
                alert('Please enter your LDAP');
                return;
            }
            
            // Hide suggestions and show loading
            suggestionsContainer.style.display = 'none';
            loadingIndicator.style.display = 'block';
            
            // Simulate loading delay for better UX
            setTimeout(() => {
                // Search for user in audience data
                const user = findUserByLdap(ldap);
                
                // Hide loading indicator
                loadingIndicator.style.display = 'none';
                
                if (user) {
                    // Update welcome message
                    welcomeText.textContent = `Welcome, ${user.Name}!`;
                    
                    // Update user details
                    updateUserInfo(user);
                    
                    // Show welcome message and user details
                    welcomeMessage.style.display = 'block';
                    userDetails.style.display = 'block';
                    
                    // Scroll to welcome message
                    welcomeMessage.scrollIntoView({ behavior: 'smooth' });
                } else {
                    // User suggestions will be shown by findUserByLdap if available
                    if (document.getElementById('userSuggestions').style.display !== 'block') {
                        alert(`User with LDAP "${ldap}" not found. Please check the LDAP or try a different one.`);
                    }
                }
            }, 500);
        }

        function findUserByLdap(ldap) {
            if (!audienceData) return null;
            
            // Case-insensitive search
            const searchLdap = ldap.toLowerCase();
            
            // Exact match first
            let exactMatch = audienceData.find(user => 
                user['ldap'] && user['ldap'].toLowerCase() === searchLdap
            );
            
            if (exactMatch) return exactMatch;
            
            // Partial match
            let partialMatch = audienceData.find(user => 
                user['ldap'] && (user['ldap'].toLowerCase().includes(searchLdap) ||
                searchLdap.includes(user['ldap'].toLowerCase()))
            );
            
            if (partialMatch) return partialMatch;
            
            // Fuzzy search for suggestions
            let suggestions = audienceData.filter(user => 
                user['ldap'] && (user['ldap'].toLowerCase().includes(searchLdap.substring(0, 3)) ||
                searchLdap.includes(user['ldap'].toLowerCase().substring(0, 3)))
            ).slice(0, 3);
            
            if (suggestions.length > 0) {
                showSuggestions(suggestions);
            }
            
            return null;
        }

        function showSuggestions(suggestions) {
            const suggestionsContainer = document.getElementById('userSuggestions');
            const suggestionsList = document.getElementById('suggestionsList');
            
            suggestionsList.innerHTML = '';
            
            suggestions.forEach(user => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.innerHTML = `
                    <div><strong>${user.Name}</strong></div>
                    <div style="font-size: 0.8rem; color: #666;">${user['ldap'] || 'No LDAP'}</div>
                `;
                suggestionItem.onclick = () => {
                    document.getElementById('ldapInput').value = user['ldap'] || '';
                    suggestionsContainer.style.display = 'none';
                    submitLdap();
                };
                suggestionsList.appendChild(suggestionItem);
            });
            
            suggestionsContainer.style.display = 'block';
        }

        function updateUserInfo(user) {
            try {
                // Update environment URL
                const envUrlElement = document.getElementById('env-url');
                if (envUrlElement && user['Env']) {
                    envUrlElement.textContent = user['Env'];
                    envUrlElement.href = user['Env'];
                } else if (envUrlElement) {
                    envUrlElement.textContent = 'Not available';
                    envUrlElement.href = '#';
                }

                // Update GitHub URL
                const githubUrlElement = document.getElementById('github-url');
                if (githubUrlElement && user['Github']) {
                    githubUrlElement.textContent = user['Github'];
                    githubUrlElement.href = user['Github'];
                } else if (githubUrlElement) {
                    githubUrlElement.textContent = 'Not available';
                    githubUrlElement.href = '#';
                }
                const formUrl = document.getElementById('form-url');
                if (formUrl && user.repo && user.ldap) {
                    const value = `https://main--${user.repo}--forms-edge-delivery.aem.live/content/forms/af/${user.ldap.toLowerCase()}/credit-card-form`
                    formUrl.textContent = value;
                    formUrl.href = value;
                } else if (formUrl) {
                    formUrl.textContent = 'Not available';
                    formUrl.href = '#';
                }
                const programUrl = document.getElementById('program-url');
                if (programUrl && user.program) {
                    programUrl.textContent = user.program;
                } else if (programUrl) {
                    programUrl.textContent = 'Not available';
                }

            } catch (error) {
                console.error('Error updating user info:', error);
            }
        }

        // Download functions
        async function downloadAllScreenshots() {
            const urls = [
                'https://main--aem-forms-lab--jalagari.aem.live/lab/screenshots/screenshot1.png',
                'https://main--aem-forms-lab--jalagari.aem.live/lab/screenshots/screenshot2.png',
                'https://main--aem-forms-lab--jalagari.aem.live/lab/screenshots/screenshot3.png'
            ];
            
            for (const url of urls) {
                const response = await fetch(url);
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = url.split('/').pop(); // e.g., screenshot1.png
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
              }
        }

        // Copy to clipboard function
        function copyToClipboard(elementId) {
            const element = document.getElementById(elementId);
            if (!element) {
                console.error('Element not found:', elementId);
                return;
            }
            
            const text = element.textContent;
            navigator.clipboard.writeText(text).then(function() {
                // Find the button that was clicked
                const button = element.parentElement.querySelector('.copy-btn');
                if (button) {
                    showCopyFeedback(button);
                }
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
                alert('Failed to copy to clipboard');
            });
        }

        // Show copy feedback
        function showCopyFeedback(button) {
            const originalText = button.innerHTML;
            const originalClass = button.className;
            
            button.innerHTML = '✅';
            button.className = originalClass + ' copied';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.className = originalClass;
            }, 2000);
        }

        // Copy prompt function
        function copyPrompt(button) {
            const promptContainer = button.parentElement;
            const textarea = promptContainer.querySelector('.prompt-text');
            const text = textarea.value;
            
            navigator.clipboard.writeText(text).then(function() {
                showCopyFeedback(button);
            }).catch(function(err) {
                console.error('Could not copy prompt: ', err);
                alert('Failed to copy prompt to clipboard');
            });
        }

        // Populate chapters section with API data
        function populateChaptersSection() {
            if (!chaptersData || chaptersData.length === 0) {
                document.getElementById('chaptersGrid').innerHTML = '<div class="loading-chapters"><span>❌ No chapters data available</span></div>';
                return;
            }

            // Group chapters by chapter number
            const groupedChapters = {};
            chaptersData.forEach(item => {
                const chapterNum = item.chapter.split('.')[0]; // Get main chapter number (e.g., "2" from "2.6")
                if (!groupedChapters[chapterNum]) {
                    groupedChapters[chapterNum] = [];
                }
                groupedChapters[chapterNum].push(item);
            });

            const chaptersGrid = document.getElementById('chaptersGrid');
            chaptersGrid.innerHTML = '';

            // Create chapter cards for each group
            Object.keys(groupedChapters).sort().forEach(chapterNum => {
                const chapterItems = groupedChapters[chapterNum];
                const chapterCard = document.createElement('div');
                chapterCard.className = 'chapter-card';
                chapterCard.setAttribute('data-chapter', chapterNum);

                // Get the first item to determine chapter name
                const firstItem = chapterItems[0];
                const chapterName = firstItem.Name || `Chapter ${chapterNum}`;
                
                chapterCard.innerHTML = `<h4>Chapter ${chapterNum}: ${chapterName}</h4>`;

                // Add sections for each item in the chapter
                chapterItems.forEach(item => {
                    const section = document.createElement('div');
                    section.className = 'section';
                    
                    const title = item.Title || `Section ${item.chapter}`;
                    
                    // Check if the item type is URL
                    if (item.Type === 'url') {
                        section.innerHTML = `
                            <h5>${title}</h5>
                            <div class="url-container">
                                <a href="${item.Prompt}" target="_blank" rel="noopener" class="url-link">${item.Prompt}</a>
                                <button class="copy-btn" onclick="copyToClipboard('${item.Prompt}')" title="Copy URL">
                                    📋
                                </button>
                            </div>
                        `;
                    } else {
                        section.innerHTML = `
                            <h5>${title}</h5>
                            <div class="prompt-container">
                                <textarea class="prompt-text" readonly>${item.Prompt || 'No prompt available'}</textarea>
                                <button class="copy-btn" onclick="copyPrompt(this)" title="Copy Prompt">
                                    📋
                                </button>
                            </div>
                        `;
                    }
                    
                    chapterCard.appendChild(section);
                });

                chaptersGrid.appendChild(chapterCard);
            });
        }

        // Allow Enter key to submit
        document.getElementById('ldapInput').addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                submitLdap();
            }
        });

        // Focus on input when page loads
        window.addEventListener('load', function() {
            document.getElementById('ldapInput').focus();
            // Fetch audience data when page loads
            fetchAudienceData();
            // Fetch chapters data when page loads
            fetchChaptersData();
        });