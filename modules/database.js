// modules/database.js

// Game data structure
let gameData = {
    characters: [],
    items: [],
    skills: [],
    factions: [],
    gatchaBanners: [],
    achievements: [],
    storyArcs: [],
    system: {
        currencies: ['Gems', 'Gold'],
        levelCurve: []
    }
};

// Initialize the database module
function initDatabase() {
    const databaseModule = document.getElementById('database-module');
    if (!databaseModule) return;
    
    databaseModule.innerHTML = `
        <div class="module-header">
            <div>
                <h2 class="module-title">Game Database</h2>
                <p class="module-description">Manage all game data in one place</p>
            </div>
            <div>
                <button class="btn btn-primary" id="save-database">
                    <i class="fas fa-save"></i> Save Database
                </button>
            </div>
        </div>
        
        <div class="tabs">
            <div class="tab active" data-tab="characters">Characters</div>
            <div class="tab" data-tab="items">Items</div>
            <div class="tab" data-tab="skills">Skills</div>
            <div class="tab" data-tab="factions">Factions</div>
            <div class="tab" data-tab="gatcha">Gatcha</div>
            <div class="tab" data-tab="achievements">Achievements</div>
            <div class="tab" data-tab="story">Story</div>
            <div class="tab" data-tab="system">System</div>
        </div>
        
        <div class="database-content" id="database-content">
            <!-- Content will be populated based on selected tab -->
        </div>
    `;
    
    // Add event listeners to tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Load content for the selected tab
            const tabName = this.getAttribute('data-tab');
            loadDatabaseTab(tabName);
        });
    });
    
    // Initialize with characters tab
    loadDatabaseTab('characters');
    
    // Save database button
    document.getElementById('save-database').addEventListener('click', saveDatabase);
    
    // Add event listener for delete character buttons (using event delegation)
    document.getElementById('database-content').addEventListener('click', function(e) {
        if (e.target.closest('.delete-character')) {
            const charId = e.target.closest('.delete-character').dataset.id;
            deleteCharacter(charId);
        }
    });
}

// Load content for a specific database tab
function loadDatabaseTab(tabName) {
    const contentElement = document.getElementById('database-content');
    if (!contentElement) return;
    
    switch(tabName) {
        case 'characters':
            renderCharactersTab();
            break;
        case 'items':
            renderItemsTab();
            break;
        case 'skills':
            renderSkillsTab();
            break;
        case 'factions':
            renderFactionsTab();
            break;
        case 'gatcha':
            renderGatchaTab();
            break;
        case 'achievements':
            renderAchievementsTab();
            break;
        case 'story':
            renderStoryTab();
            break;
        case 'system':
            renderSystemTab();
            break;
        default:
            contentElement.innerHTML = `<p>Select a database category to manage</p>`;
    }
}

// Save the entire database
function saveDatabase() {
    try {
        localStorage.setItem('gachamakerData', JSON.stringify(gameData));
        document.querySelector('.status-indicator').style.backgroundColor = 'var(--success)';
        document.querySelector('.status span').textContent = 'Database Saved';
        
        setTimeout(() => {
            document.querySelector('.status span').textContent = 'Ready';
        }, 2000);
    } catch (error) {
        console.error('Error saving database:', error);
        document.querySelector('.status-indicator').style.backgroundColor = 'var(--danger)';
        document.querySelector('.status span').textContent = 'Save Failed';
        
        setTimeout(() => {
            document.querySelector('.status span').textContent = 'Ready';
            document.querySelector('.status-indicator').style.backgroundColor = 'var(--success)';
        }, 3000);
    }
}

// Load the database from storage
function loadDatabase() {
    const savedData = localStorage.getItem('gachamakerData');
    if (savedData) {
        try {
            gameData = JSON.parse(savedData);
            return true;
        } catch (error) {
            console.error('Error loading database:', error);
            return false;
        }
    }
    return false;
}

// Render the characters tab
function renderCharactersTab() {
    const contentElement = document.getElementById('database-content');
    if (!contentElement) return;
    
    contentElement.innerHTML = `
        <div class="database-grid">
            <div class="database-section">
                <h3>Character List</h3>
                <div id="characters-list">
                    ${gameData.characters.length > 0 ? 
                        gameData.characters.map(char => renderCharacterItem(char)).join('') : 
                        '<p>No characters created yet</p>'}
                </div>
                <button class="btn btn-success" id="add-character" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Add Character
                </button>
            </div>
            <div class="database-section">
                <h3>Character Editor</h3>
                <div id="character-editor">
                    <p>Select a character to edit or create a new one</p>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addCharacterBtn = document.getElementById('add-character');
    if (addCharacterBtn) {
        addCharacterBtn.addEventListener('click', () => {
            openCharacterEditor(null);
        });
    }
    
    // Event delegation for character items
    document.getElementById('characters-list').addEventListener('click', function(e) {
        const characterItem = e.target.closest('.character-item');
        if (characterItem) {
            const charId = characterItem.dataset.id;
            const character = gameData.characters.find(c => c.id === charId);
            if (character) {
                openCharacterEditor(character);
            }
        }
    });
}

// Render a character item for the list
function renderCharacterItem(character) {
    return `
        <div class="database-item character-item" data-id="${character.id}">
            <img src="${character.image || 'https://via.placeholder.com/50'}" alt="${character.name}">
            <div class="database-item-content">
                <div class="database-item-title">${character.name}</div>
                <div class="database-item-meta">
                    <span class="rarity ${character.rarity}">${character.rarity}</span>
                    <span>${character.faction || 'No Faction'}</span>
                </div>
            </div>
            <div class="database-item-actions">
                <button class="btn btn-sm btn-danger delete-character" data-id="${character.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Delete a character
function deleteCharacter(charId) {
    if (confirm('Are you sure you want to delete this character?')) {
        gameData.characters = gameData.characters.filter(c => c.id !== charId);
        renderCharactersTab();
        
        document.querySelector('.status-indicator').style.backgroundColor = 'var(--success)';
        document.querySelector('.status span').textContent = 'Character Deleted';
        
        setTimeout(() => {
            document.querySelector('.status span').textContent = 'Ready';
        }, 2000);
    }
}

// Open the character editor
function openCharacterEditor(character) {
    const isNew = !character;
    
    const editorElement = document.getElementById('character-editor');
    if (!editorElement) return;
    
    editorElement.innerHTML = `
        <div class="form-group">
            <label>Character Name</label>
            <input type="text" id="char-name" value="${character?.name || ''}" placeholder="Enter character name">
        </div>
        
        <div class="form-group">
            <label>Title</label>
            <input type="text" id="char-title" value="${character?.title || ''}" placeholder="Character title">
        </div>
        
        <div class="form-group">
            <label>Rarity</label>
            <select id="char-rarity">
                <option value="common" ${character?.rarity === 'common' ? 'selected' : ''}>Common</option>
                <option value="uncommon" ${character?.rarity === 'uncommon' ? 'selected' : ''}>Uncommon</option>
                <option value="rare" ${character?.rarity === 'rare' ? 'selected' : ''}>Rare</option>
                <option value="epic" ${character?.rarity === 'epic' ? 'selected' : ''}>Epic</option>
                <option value="legendary" ${character?.rarity === 'legendary' ? 'selected' : ''}>Legendary</option>
                <option value="mythic" ${character?.rarity === 'mythic' ? 'selected' : ''}>Mythic</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Faction</label>
            <select id="char-faction">
                <option value="">No Faction</option>
                ${gameData.factions.map(f => 
                    `<option value="${f.id}" ${character?.factionId === f.id ? 'selected' : ''}>${f.name}</option>`
                ).join('')}
            </select>
        </div>
        
        <div class="form-group">
            <label>Character Image</label>
            <div class="drop-zone" id="char-image-drop">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & Drop your character image here</p>
                <p>or click to select</p>
                <input type="file" id="char-image-input" accept="image/*" style="display: none;">
            </div>
            <img id="char-image-preview" class="image-preview" src="${character?.image || ''}" alt="Preview">
        </div>
        
        <div class="form-group">
            <label>Description</label>
            <textarea id="char-description" rows="3">${character?.description || ''}</textarea>
        </div>
        
        <h4>Base Stats</h4>
        <div class="stats-grid">
            <div class="form-group stat-input">
                <label>HP</label>
                <input type="number" id="char-hp" value="${character?.stats?.hp || 100}">
            </div>
            <div class="form-group stat-input">
                <label>Attack</label>
                <input type="number" id="char-atk" value="${character?.stats?.attack || 10}">
            </div>
            <div class="form-group stat-input">
                <label>Defense</label>
                <input type="number" id="char-def" value="${character?.stats?.defense || 5}">
            </div>
            <div class="form-group stat-input">
                <label>Speed</label>
                <input type="number" id="char-spd" value="${character?.stats?.speed || 5}">
            </div>
        </div>
        
        <h4>Abilities</h4>
        <div id="char-abilities">
            ${renderCharacterAbilities(character)}
        </div>
        
        <div class="form-actions" style="margin-top: 20px;">
            <button class="btn btn-primary" id="save-character">
                <i class="fas fa-save"></i> ${isNew ? 'Create Character' : 'Save Changes'}
            </button>
            <button class="btn btn-secondary" id="cancel-character">Cancel</button>
        </div>
    `;
    
    // Set up image upload
    setupImageUpload('char-image-drop', 'char-image-input', 'char-image-preview');
    
    // Save character event
    const saveBtn = document.getElementById('save-character');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveCharacter(character);
        });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-character');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editorElement.innerHTML = '<p>Select a character to edit or create a new one</p>';
        });
    }
    
    // Add ability buttons
    document.querySelectorAll('.add-ability').forEach(btn => {
        btn.addEventListener('click', function() {
            const abilityType = this.getAttribute('data-type');
            openAbilityModal(abilityType, character);
        });
    });
}

// Render character abilities section
function renderCharacterAbilities(character) {
    const abilities = character?.abilities || {};
    const abilityTypes = [
        { key: 'basic', name: 'Basic Attack' },
        { key: 'skill', name: 'Skill' },
        { key: 'ultimate', name: 'Ultimate' },
        { key: 'passive', name: 'Passive' },
        { key: 'leader', name: 'Leader' }
    ];
    
    return abilityTypes.map(type => {
        const ability = abilities[type.key];
        return `
            <div class="form-group">
                <label>${type.name}</label>
                <div class="form-row">
                    <select id="char-ability-${type.key}" class="ability-select">
                        <option value="">Select ${type.name}</option>
                        ${gameData.skills.map(skill => 
                            `<option value="${skill.id}" ${ability?.id === skill.id ? 'selected' : ''}>
                                ${skill.name} (${skill.element})
                            </option>`
                        ).join('')}
                    </select>
                    <button class="btn btn-sm btn-info add-ability" data-type="${type.key}">
                        <i class="fas fa-plus"></i> Create New
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Set up image upload with drag and drop
function setupImageUpload(dropZoneId, inputId, previewId) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!dropZone || !fileInput || !preview) return;
    
    if (preview.src && preview.src !== window.location.href) {
        preview.style.display = 'block';
    }
    
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Drag and drop events
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('active');
    });
    
    dropZone.addEventListener('dragleave', function() {
        this.classList.remove('active');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            fileInput.files = e.dataTransfer.files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });
}

// Save character to the database
function saveCharacter(character) {
    const isNew = !character;
    
    // SAFETY CHECK: Verify all form elements exist before accessing them
    const nameInput = document.getElementById('char-name');
    const titleInput = document.getElementById('char-title');
    const raritySelect = document.getElementById('char-rarity');
    const factionSelect = document.getElementById('char-faction');
    const descriptionTextarea = document.getElementById('char-description');
    const imagePreview = document.getElementById('char-image-preview');
    const hpInput = document.getElementById('char-hp');
    const atkInput = document.getElementById('char-atk');
    const defInput = document.getElementById('char-def');
    const spdInput = document.getElementById('char-spd');
    
    // If any critical element is missing, exit early
    if (!nameInput || !raritySelect || !hpInput || !atkInput || !defInput || !spdInput) {
        console.error('One or more critical form elements are missing');
        document.querySelector('.status-indicator').style.backgroundColor = 'var(--danger)';
        document.querySelector('.status span').textContent = 'Error: Form not ready';
        
        setTimeout(() => {
            document.querySelector('.status span').textContent = 'Ready';
            document.querySelector('.status-indicator').style.backgroundColor = 'var(--success)';
        }, 3000);
        return;
    }
    
    const charData = {
        id: character?.id || Date.now().toString(),
        name: nameInput.value || '',
        title: titleInput?.value || '',
        rarity: raritySelect.value || 'common',
        factionId: factionSelect?.value || '',
        description: descriptionTextarea?.value || '',
        image: imagePreview?.src || '',
        stats: {
            hp: parseInt(hpInput.value) || 100,
            attack: parseInt(atkInput.value) || 10,
            defense: parseInt(defInput.value) || 5,
            speed: parseInt(spdInput.value) || 5
        },
        abilities: {}
    };
    
    // Save abilities
    ['basic', 'skill', 'ultimate', 'passive', 'leader'].forEach(type => {
        const select = document.getElementById(`char-ability-${type}`);
        if (select && select.value) {
            charData.abilities[type] = {
                id: select.value,
                name: select.options[select.selectedIndex]?.text?.split(' (')[0] || 'Unknown Ability'
            };
        }
    });
    
    if (isNew) {
        gameData.characters.push(charData);
    } else {
        const index = gameData.characters.findIndex(c => c.id === character.id);
        if (index !== -1) {
            gameData.characters[index] = charData;
        }
    }
    
    // Refresh the characters list
    renderCharactersTab();
    
    // Show success message - FIXED SYNTAX ERROR HERE
    document.querySelector('.status-indicator').style.backgroundColor = 'var(--success)';
    document.querySelector('.status span').textContent = isNew ? 'Character Created' : 'Character Updated';
    
    setTimeout(() => {
        document.querySelector('.status span').textContent = 'Ready';
    }, 2000);
}

// Open ability creation modal
function openAbilityModal(abilityType, character) {
    const modal = document.getElementById('ability-modal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <h3>Create New ${abilityType.charAt(0).toUpperCase() + abilityType.slice(1)} Ability</h3>
        <div class="form-group">
            <label>Ability Name</label>
            <input type="text" id="ability-name" placeholder="Enter ability name">
        </div>
        
        <div class="form-group">
            <label>Element</label>
            <select id="ability-element">
                <option value="fire">Fire</option>
                <option value="water">Water</option>
                <option value="earth">Earth</option>
                <option value="wind">Wind</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="neutral">Neutral</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Base Damage</label>
            <input type="number" id="ability-damage" value="100">
        </div>
        
        <div class="form-group">
            <label>Description</label>
            <textarea id="ability-desc" rows="3"></textarea>
        </div>
        
        <div class="form-group">
            <label>Animation</label>
            <div class="drop-zone" id="ability-anim-drop">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & Drop animation file (GIF/PNG)</p>
                <p>or click to select</p>
                <input type="file" id="ability-anim-input" accept="image/*" style="display: none;">
            </div>
            <img id="ability-anim-preview" class="image-preview" alt="Animation Preview">
        </div>
        
        <div class="form-actions" style="margin-top: 20px;">
            <button class="btn btn-primary" id="save-ability">
                <i class="fas fa-save"></i> Save Ability
            </button>
            <button class="btn btn-secondary" id="cancel-ability">Cancel</button>
        </div>
    `;
    
    // Setup image upload for animation
    setupImageUpload('ability-anim-drop', 'ability-anim-input', 'ability-anim-preview');
    
    // Save ability
    const saveBtn = document.getElementById('save-ability');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const abilityData = {
                id: Date.now().toString(),
                name: document.getElementById('ability-name')?.value || 'New Ability',
                type: abilityType,
                element: document.getElementById('ability-element')?.value || 'neutral',
                damage: parseInt(document.getElementById('ability-damage')?.value) || 100,
                description: document.getElementById('ability-desc')?.value || '',
                animation: document.getElementById('ability-anim-preview')?.src || ''
            };
            
            gameData.skills.push(abilityData);
            
            // Close the modal
            modal.style.display = 'none';
            
            // Refresh the character editor to show the new ability
            if (character) {
                openCharacterEditor(character);
            }
        });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-ability');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close button
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Show the modal
    modal.style.display = 'flex';
}

// ITEMS TAB - Placeholder implementation
function renderItemsTab() {
    const contentElement = document.getElementById('database-content');
    if (!contentElement) return;
    
    contentElement.innerHTML = `
        <div class="database-grid">
            <div class="database-section">
                <h3>Item List</h3>
                <p>This section is under development. Coming soon!</p>
                <button class="btn btn-success" id="add-item" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Add Item
                </button>
            </div>
            <div class="database-section">
                <h3>Item Editor</h3>
                <p>Select an item to edit or create a new one</p>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addItemBtn = document.getElementById('add-item');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            alert('Item creation functionality will be available in the next update!');
        });
    }
}

// SKILLS TAB - Placeholder implementation
function renderSkillsTab() {
    const contentElement = document.getElementById('database-content');
    if (!contentElement) return;
    
    contentElement.innerHTML = `
        <div class="database-grid">
            <div class="database-section">
                <h3>Skills List</h3>
                <p>This section is under development. Coming soon!</p>
                <button class="btn btn-success" id="add-skill" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Add Skill
                </button>
            </div>
            <div class="database-section">
                <h3>Skill Editor</h3>
                <p>Select a skill to edit or create a new one</p>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addSkillBtn = document.getElementById('add-skill');
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', function() {
            alert('Skill creation functionality will be available in the next update!');
        });
    }
}

// FACTIONS TAB - Placeholder implementation
function renderFactionsTab() {
    const contentElement = document.getElementById('database-content');
    if (!contentElement) return;
    
    contentElement.innerHTML = `
        <div class="database-grid">
            <div class="database-section">
                <h3>Faction List</h3>
                <p>This section is under development. Coming soon!</p>
                <button class="btn btn-success" id="add-faction" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Add Faction
                </button>
            </div>
            <div class="database-section">
                <h3>Faction Editor</h3>
                <p>Select a faction to edit or create a new one</p>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addFactionBtn = document.getElementById('add-faction');
    if (addFactionBtn) {
        addFactionBtn.addEventListener('click', function() {
            alert('Faction creation functionality will be available in the next update!');
        });
    }
}

// GATCHA TAB - Placeholder implementation
function renderGatchaTab() {
    const contentElement = document.getElementById('database-content');
    if (!contentElement) return;
    
    contentElement.innerHTML = `
        <div class="database-grid">
            <div class="database-section">
                <h3>Gatcha Banners</h3>
                <p>This section is under development. Coming soon!</p>
                <button class="btn btn-success" id="add-banner" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Add Banner
                </button>
            </div>
            <div class="database-section">
                <h3>Banner Editor</h3>
                <p>Select a banner to edit or create a new one</p>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addBannerBtn = document.getElementById('add-banner');
    if (addBannerBtn) {
        addBannerBtn.addEventListener('click', function() {
            alert('Gatcha banner creation functionality will be available in the next update!');
        });
    }
}

// ACHIEVEMENTS TAB - Placeholder implementation
function renderAchievementsTab() {
    const contentElement = document.getElementById('database-content');
    if (!contentElement) return;
    
    contentElement.innerHTML = `
        <div class="database-grid">
            <div class="database-section">
                <h3>Achievements List</h3>
                <p>This section is under development. Coming soon!</p>
                <button class="btn btn-success" id="add-achievement" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Add Achievement
                </button>
            </div>
            <div class="database-section">
                <h3>Achievement Editor</h3>
                <p>Select an achievement to edit or create a new one</p>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addAchievementBtn = document.getElementById('add-achievement');
    if (addAchievementBtn) {
        addAchievementBtn.addEventListener('click', function() {
            alert('Achievement creation functionality will be available in the next update!');
        });
    }
}

// STORY TAB - Placeholder implementation
function renderStoryTab() {
    const contentElement = document.getElementById('database-content');
    if (!contentElement) return;
    
    contentElement.innerHTML = `
        <div class="database-grid">
            <div class="database-section">
                <h3>Story Arcs</h3>
                <p>This section is under development. Coming soon!</p>
                <button class="btn btn-success" id="add-arc" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Add Story Arc
                </button>
            </div>
            <div class="database-section">
                <h3>Story Editor</h3>
                <p>Select a story arc to edit or create a new one</p>
            </div>
        </div>
    `;
    
    // Add event listeners
    const addArcBtn = document.getElementById('add-arc');
    if (addArcBtn) {
        addArcBtn.addEventListener('click', function() {
            alert('Story creation functionality will be available in the next update!');
        });
    }
}

// SYSTEM TAB - Placeholder implementation
function renderSystemTab() {
    const contentElement = document.getElementById('database-content');
    if (!contentElement) return;
    
    contentElement.innerHTML = `
        <div class="database-section">
            <h3>System Settings</h3>
            <p>This section is under development. Coming soon!</p>
            
            <div class="form-group">
                <label>Currencies</label>
                <div id="currencies-list">
                    ${gameData.system.currencies.map(currency => `
                        <div class="database-item" style="margin-bottom: 5px;">
                            <div class="database-item-content">
                                <div class="database-item-title">${currency}</div>
                            </div>
                            <div class="database-item-actions">
                                <button class="btn btn-sm btn-danger delete-currency" data-currency="${currency}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="form-row" style="margin-top: 10px;">
                    <input type="text" id="new-currency" placeholder="New currency name">
                    <button class="btn btn-sm btn-success" id="add-currency">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label>Level Curve</label>
                <p>Configure how experience points translate to levels</p>
                <div id="level-curve">
                    <p>Level curve configuration coming soon...</p>
                </div>
            </div>
        </div>
    `;
    
    // Add currency event
    document.getElementById('add-currency').addEventListener('click', function() {
        const currencyInput = document.getElementById('new-currency');
        const currencyName = currencyInput.value.trim();
        
        if (currencyName && !gameData.system.currencies.includes(currencyName)) {
            gameData.system.currencies.push(currencyName);
            currencyInput.value = '';
            renderSystemTab();
        }
    });
    
    // Delete currency event (using event delegation)
    document.getElementById('currencies-list').addEventListener('click', function(e) {
        if (e.target.closest('.delete-currency')) {
            const currency = e.target.closest('.delete-currency').dataset.currency;
            gameData.system.currencies = gameData.system.currencies.filter(c => c !== currency);
            renderSystemTab();
        }
    });
}

// Load the database when the module is initialized
loadDatabase();
