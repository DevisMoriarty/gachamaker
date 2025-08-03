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
        rarities: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'],
        elements: ['Fire', 'Water', 'Earth', 'Wind', 'Light', 'Dark', 'Neutral'],
        levelCurve: []
    }
};

// Animation preview state
let animationPreview = {
    isPlaying: false,
    currentFrame: 0,
    intervalId: null
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
                    <span class="rarity ${character.rarity.toLowerCase()}">${character.rarity}</span>
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
            <label>Character Name *</label>
            <input type="text" id="char-name" value="${character?.name || ''}" placeholder="Enter character name" required>
        </div>
        
        <div class="form-group">
            <label>Title (Optional)</label>
            <input type="text" id="char-title" value="${character?.title || ''}" placeholder="Character title">
        </div>
        
        <div class="form-group">
            <label>Rarity *</label>
            <select id="char-rarity" required>
                ${gameData.system.rarities.map(rarity => 
                    `<option value="${rarity}" ${character?.rarity === rarity ? 'selected' : ''}>${rarity}</option>`
                ).join('')}
            </select>
        </div>
        
        <div class="form-group">
            <label>Faction (Optional)</label>
            <select id="char-faction">
                <option value="">No Faction</option>
                ${gameData.factions.map(f => 
                    `<option value="${f.id}" ${character?.factionId === f.id ? 'selected' : ''}>${f.name}</option>`
                ).join('')}
            </select>
        </div>
        
        <div class="form-section">
            <h4>Character Appearance</h4>
            
            <div class="form-group">
                <label>Character Image *</label>
                <div class="drop-zone" id="char-image-drop">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag & Drop your character image here</p>
                    <p>or click to select</p>
                    <input type="file" id="char-image-input" accept="image/*" style="display: none;">
                </div>
                <img id="char-image-preview" class="image-preview" src="${character?.image || ''}" alt="Preview">
            </div>
            
            <div class="form-group">
                <label>Animation Type</label>
                <select id="char-animation-type">
                    <option value="static" ${character?.animationType === 'static' ? 'selected' : ''}>Static Image</option>
                    <option value="spritesheet" ${character?.animationType === 'spritesheet' ? 'selected' : ''}>Spritesheet Animation</option>
                    <option value="frame-by-frame" ${character?.animationType === 'frame-by-frame' ? 'selected' : ''}>Frame-by-Frame</option>
                </select>
            </div>
            
            <div id="animation-options" style="display: ${character?.animationType === 'static' ? 'none' : 'block'};">
                ${character?.animationType === 'spritesheet' ? 
                    renderSpritesheetOptions(character) : 
                    renderFrameByFrameOptions(character)}
            </div>
        </div>
        
        <div class="form-group">
            <label>Description</label>
            <textarea id="char-description" rows="3">${character?.description || ''}</textarea>
        </div>
        
        <h4>Base Stats</h4>
        <div class="stats-grid">
            <div class="form-group stat-input">
                <label>HP *</label>
                <input type="number" id="char-hp" value="${character?.stats?.hp || 100}" min="1" required>
            </div>
            <div class="form-group stat-input">
                <label>Attack *</label>
                <input type="number" id="char-atk" value="${character?.stats?.attack || 10}" min="1" required>
            </div>
            <div class="form-group stat-input">
                <label>Defense *</label>
                <input type="number" id="char-def" value="${character?.stats?.defense || 5}" min="0" required>
            </div>
            <div class="form-group stat-input">
                <label>Speed *</label>
                <input type="number" id="char-spd" value="${character?.stats?.speed || 5}" min="0" required>
            </div>
        </div>
        
        <h4>Abilities</h4>
        <div id="char-abilities">
            ${renderCharacterAbilities(character)}
        </div>
        
        <h4>Character Relationships</h4>
        <div class="form-section">
            <div class="relationship-tree-container" id="relationship-tree">
                <!-- Relationship tree will be rendered here -->
            </div>
            
            <div class="relationship-controls">
                <button class="btn btn-sm btn-info add-character-relationship" style="margin-top: 5px;">
                    <i class="fas fa-plus"></i> Add Character to Tree
                </button>
            </div>
        </div>
        
        <h4>Evolutions & Upgrades</h4>
        <div class="form-section">
            <div class="form-group">
                <label>Evolves Into</label>
                <div class="evolution-container" id="char-evolutions">
                    ${character?.evolutions?.map(evolution => 
                        `<div class="evolution-item">
                            <div class="form-row" style="margin-bottom: 5px;">
                                <select class="character-select" style="flex: 2;">
                                    ${gameData.characters.filter(c => c.id !== character.id).map(c => 
                                        `<option value="${c.id}" ${c.id === evolution.targetId ? 'selected' : ''}>${c.name}</option>`
                                    ).join('')}
                                </select>
                                <input type="text" class="evolution-requirements" value="${evolution.requirements || ''}" placeholder="Requirements" style="flex: 1;">
                                <button class="btn btn-sm btn-danger remove-evolution">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>`
                    ).join('')}
                </div>
                <button class="btn btn-sm btn-info add-evolution" style="margin-top: 5px;">
                    <i class="fas fa-plus"></i> Add Evolution
                </button>
            </div>
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
    
    // Animation type change
    document.getElementById('char-animation-type').addEventListener('change', function() {
        const animationType = this.value;
        const optionsContainer = document.getElementById('animation-options');
        
        if (animationType === 'static') {
            optionsContainer.style.display = 'none';
        } else {
            optionsContainer.style.display = 'block';
            optionsContainer.innerHTML = animationType === 'spritesheet' ? 
                renderSpritesheetOptions(character) : 
                renderFrameByFrameOptions(character);
        }
    });
    
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
    
    // Add evolution button
    document.querySelector('.add-evolution').addEventListener('click', addEvolution);
    
    // Remove evolution buttons
    document.querySelectorAll('.remove-evolution').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.evolution-item').remove();
        });
    });
    
    // Add ability buttons
    document.querySelectorAll('.add-ability').forEach(btn => {
        btn.addEventListener('click', function() {
            const abilityType = this.getAttribute('data-type');
            openAbilityModal(abilityType, character);
        });
    });
    
    // Initialize relationship tree
    if (character) {
        renderRelationshipTree(character);
    }
    
    // Add character to relationship tree button
    document.querySelector('.add-character-relationship').addEventListener('click', function() {
        addCharacterToRelationshipTree();
    });
}

// Render spritesheet options
function renderSpritesheetOptions(character) {
    return `
        <div class="form-group">
            <label>Spritesheet Image</label>
            <div class="drop-zone" id="spritesheet-drop">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & Drop spritesheet image here</p>
                <p>or click to select</p>
                <input type="file" id="spritesheet-input" accept="image/*" style="display: none;">
            </div>
            <img id="spritesheet-preview" class="image-preview" src="${character?.spritesheet?.image || ''}" alt="Spritesheet Preview">
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Frames per Row</label>
                <input type="number" id="spritesheet-frames-row" value="${character?.spritesheet?.framesPerRow || 4}" min="1">
            </div>
            <div class="form-group">
                <label>Total Frames</label>
                <input type="number" id="spritesheet-total-frames" value="${character?.spritesheet?.totalFrames || 16}" min="1">
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Frame Width (px)</label>
                <input type="number" id="spritesheet-frame-width" value="${character?.spritesheet?.frameWidth || 32}" min="1">
            </div>
            <div class="form-group">
                <label>Frame Height (px)</label>
                <input type="number" id="spritesheet-frame-height" value="${character?.spritesheet?.frameHeight || 32}" min="1">
            </div>
        </div>
        
        <div class="form-group">
            <label>Animation Speed</label>
            <input type="range" id="spritesheet-speed" min="1" max="30" value="${character?.spritesheet?.speed || 10}">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--gray);">
                <span>Slow</span>
                <span>Medium</span>
                <span>Fast</span>
            </div>
        </div>
        
        <div class="form-group">
            <button class="btn btn-sm btn-info" id="play-spritesheet-animation">
                <i class="fas fa-play"></i> Play Animation
            </button>
            <button class="btn btn-sm btn-secondary" id="stop-spritesheet-animation">
                <i class="fas fa-stop"></i> Stop Animation
            </button>
        </div>
    `;
}

// Render frame-by-frame animation options
function renderFrameByFrameOptions(character) {
    return `
        <div class="form-group">
            <label>Animation Profile Name</label>
            <input type="text" id="frame-profile-name" value="${character?.frameByFrame?.profileName || 'Animation Profile'}" placeholder="Enter profile name">
        </div>
        
        <div class="form-row" style="margin-bottom: 10px;">
            <div class="form-group" style="flex: 1; margin-right: 10px;">
                <label>Frame 1</label>
                <div class="drop-zone" id="frame1-drop">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag & Drop frame image here</p>
                    <p>or click to select</p>
                    <input type="file" id="frame1-input" accept="image/*" style="display: none;">
                </div>
                <img id="frame1-preview" class="image-preview" src="${character?.frameByFrame?.frames?.[0] || ''}" alt="Frame 1 Preview">
                <div class="form-group">
                    <label>Duration (ms)</label>
                    <input type="number" id="frame1-duration" value="${character?.frameByFrame?.durations?.[0] || 200}" min="50">
                </div>
            </div>
            
            <div class="form-group" style="flex: 1; margin-right: 10px;">
                <label>Frame 2</label>
                <div class="drop-zone" id="frame2-drop">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag & Drop frame image here</p>
                    <p>or click to select</p>
                    <input type="file" id="frame2-input" accept="image/*" style="display: none;">
                </div>
                <img id="frame2-preview" class="image-preview" src="${character?.frameByFrame?.frames?.[1] || ''}" alt="Frame 2 Preview">
                <div class="form-group">
                    <label>Duration (ms)</label>
                    <input type="number" id="frame2-duration" value="${character?.frameByFrame?.durations?.[1] || 200}" min="50">
                </div>
            </div>
            
            <div class="form-group" style="flex: 1;">
                <label>Frame 3</label>
                <div class="drop-zone" id="frame3-drop">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag & Drop frame image here</p>
                    <p>or click to select</p>
                    <input type="file" id="frame3-input" accept="image/*" style="display: none;">
                </div>
                <img id="frame3-preview" class="image-preview" src="${character?.frameByFrame?.frames?.[2] || ''}" alt="Frame 3 Preview">
                <div class="form-group">
                    <label>Duration (ms)</label>
                    <input type="number" id="frame3-duration" value="${character?.frameByFrame?.durations?.[2] || 200}" min="50">
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label>Animation Speed</label>
            <input type="range" id="framebyframe-speed" min="1" max="30" value="${character?.frameByFrame?.speed || 10}">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--gray);">
                <span>Slow</span>
                <span>Medium</span>
                <span>Fast</span>
            </div>
        </div>
        
        <div class="form-group">
            <button class="btn btn-sm btn-info" id="play-frame-animation">
                <i class="fas fa-play"></i> Play Animation
            </button>
            <button class="btn btn-sm btn-secondary" id="stop-frame-animation">
                <i class="fas fa-stop"></i> Stop Animation
            </button>
        </div>
    `;
}

// Add evolution
function addEvolution() {
    const container = document.getElementById('char-evolutions');
    const characterOptions = gameData.characters
        .filter(c => !document.querySelectorAll('#char-evolutions .character-select').some(select => 
            select.value === c.id))
        .map(c => `<option value="${c.id}">${c.name}</option>`)
        .join('');
    
    const newItem = document.createElement('div');
    newItem.className = 'evolution-item';
    newItem.innerHTML = `
        <div class="form-row" style="margin-bottom: 5px;">
            <select class="character-select" style="flex: 2;">
                <option value="">Select character</option>
                ${characterOptions}
            </select>
            <input type="text" class="evolution-requirements" value="" placeholder="Requirements" style="flex: 1;">
            <button class="btn btn-sm btn-danger remove-evolution">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    container.appendChild(newItem);
    
    // Add event listener to the new remove button
    newItem.querySelector('.remove-evolution').addEventListener('click', function() {
        this.closest('.evolution-item').remove();
    });
}

// Render character abilities section
function renderCharacterAbilities(character) {
    const abilities = character?.abilities || {};
    const abilityTypes = [
        { key: 'basic', name: 'Basic Attack', required: true },
        { key: 'skill', name: 'Skill', required: true },
        { key: 'ultimate', name: 'Ultimate', required: true },
        { key: 'passive', name: 'Passive', required: false },
        { key: 'leader', name: 'Leader', required: false }
    ];
    
    return abilityTypes.map(type => {
        const ability = abilities[type.key];
        return `
            <div class="form-group">
                <label>${type.name}${type.required ? ' *' : ''}</label>
                <div class="form-row">
                    <select id="char-ability-${type.key}" class="ability-select" ${type.required ? 'required' : ''}>
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
                ${ability && type.key !== 'basic' && type.key !== 'skill' && type.key !== 'ultimate' ? 
                    renderAbilityBuilder(type.key, ability) : ''}
            </div>
        `;
    }).join('');
}

// Render ability builder for passive and leader abilities
function renderAbilityBuilder(abilityType, ability) {
    if (abilityType !== 'passive' && abilityType !== 'leader') return '';
    
    return `
        <div class="ability-builder" style="margin-top: 10px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px;">
            <div class="ability-builder-header" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <h5>${abilityType.charAt(0).toUpperCase() + abilityType.slice(1)} Ability Builder</h5>
                <button class="btn btn-sm btn-secondary" id="reset-${abilityType}-builder">
                    <i class="fas fa-redo"></i> Reset
                </button>
            </div>
            
            <div class="ability-builder-container" style="min-height: 100px; border: 1px dashed var(--gray); border-radius: 5px; padding: 10px; margin-bottom: 10px;">
                ${ability?.builder?.conditions ? renderAbilityConditions(ability.builder.conditions) : '<p>Drag & drop conditions here</p>'}
            </div>
            
            <div class="ability-builder-palette" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="character-in-team">
                    <i class="fas fa-users"></i> Character in Team
                </div>
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="character-as-leader">
                    <i class="fas fa-crown"></i> Character as Leader
                </div>
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="team-size">
                    <i class="fas fa-layer-group"></i> Team Size
                </div>
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="rarity">
                    <i class="fas fa-star"></i> Character Rarity
                </div>
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="faction">
                    <i class="fas fa-shield-alt"></i> Character Faction
                </div>
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="element">
                    <i class="fas fa-fire"></i> Character Element
                </div>
                <div class="builder-palette-item" draggable="true" data-type="effect" data-value="stat-bonus">
                    <i class="fas fa-plus-circle"></i> Stat Bonus
                </div>
                <div class="builder-palette-item" draggable="true" data-type="effect" data-value="transform">
                    <i class="fas fa-sync-alt"></i> Transform Unit
                </div>
                <div class="builder-palette-item" draggable="true" data-type="effect" data-value="effect">
                    <i class="fas fa-bolt"></i> Apply Effect
                </div>
            </div>
        </div>
    `;
}

// Render ability conditions
function renderAbilityConditions(conditions) {
    if (!conditions || conditions.length === 0) return '<p>Drag & drop conditions here</p>';
    
    return conditions.map((cond, index) => {
        let content = '';
        
        switch(cond.type) {
            case 'character-in-team':
                content = `
                    <div class="condition-item" data-index="${index}">
                        <strong>IF</strong> 
                        <select class="character-select">
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}" ${c.id === cond.characterId ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                        IN TEAM
                    </div>
                `;
                break;
            case 'character-as-leader':
                content = `
                    <div class="condition-item" data-index="${index}">
                        <strong>IF</strong> 
                        <select class="character-select">
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}" ${c.id === cond.characterId ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                        AS LEADER
                    </div>
                `;
                break;
            case 'team-size':
                content = `
                    <div class="condition-item" data-index="${index}">
                        <strong>IF</strong> TEAM SIZE 
                        <select class="operator">
                            <option value="==" ${cond.operator === '==' ? 'selected' : ''}>=</option>
                            <option value=">=" ${cond.operator === '>=' ? 'selected' : ''}>&ge;</option>
                            <option value="<=" ${cond.operator === '<=' ? 'selected' : ''}>&le;</option>
                        </select>
                        ${cond.value}
                    </div>
                `;
                break;
            case 'rarity':
                content = `
                    <div class="condition-item" data-index="${index}">
                        <strong>IF</strong> 
                        <select class="character-select">
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}" ${c.id === cond.characterId ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                        RARITY IS 
                        <select class="rarity-select">
                            ${gameData.system.rarities.map(r => 
                                `<option value="${r}" ${r === cond.rarity ? 'selected' : ''}>${r}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                break;
            case 'faction':
                content = `
                    <div class="condition-item" data-index="${index}">
                        <strong>IF</strong> 
                        <select class="character-select">
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}" ${c.id === cond.characterId ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                        BELONGS TO 
                        <select class="faction-select">
                            ${gameData.factions.map(f => 
                                `<option value="${f.id}" ${f.id === cond.factionId ? 'selected' : ''}>${f.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                break;
            case 'element':
                content = `
                    <div class="condition-item" data-index="${index}">
                        <strong>IF</strong> 
                        <select class="character-select">
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}" ${c.id === cond.characterId ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                        ELEMENT IS 
                        <select class="element-select">
                            ${gameData.system.elements.map(e => 
                                `<option value="${e}" ${e === cond.element ? 'selected' : ''}>${e}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                break;
            case 'stat-bonus':
                content = `
                    <div class="effect-item" data-index="${index}">
                        ADD 
                        <input type="number" class="bonus-value" value="${cond.value}" min="1" max="100" style="width: 50px;">
                        % TO 
                        <select class="stat-select">
                            <option value="atk" ${cond.stat === 'atk' ? 'selected' : ''}>ATK</option>
                            <option value="def" ${cond.stat === 'def' ? 'selected' : ''}>DEF</option>
                            <option value="hp" ${cond.stat === 'hp' ? 'selected' : ''}>HP</option>
                            <option value="spd" ${cond.stat === 'spd' ? 'selected' : ''}>SPD</option>
                        </select>
                    </div>
                `;
                break;
            case 'transform':
                content = `
                    <div class="effect-item" data-index="${index}">
                        TRANSFORM INTO 
                        <select class="character-select">
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}" ${c.id === cond.targetId ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                break;
            case 'effect':
                content = `
                    <div class="effect-item" data-index="${index}">
                        APPLY 
                        <select class="effect-select">
                            <option value="buff" ${cond.effect === 'buff' ? 'selected' : ''}>Buff</option>
                            <option value="debuff" ${cond.effect === 'debuff' ? 'selected' : ''}>Debuff</option>
                            <option value="heal" ${cond.effect === 'heal' ? 'selected' : ''}>Heal</option>
                        </select>
                        FOR 
                        <input type="number" class="duration" value="${cond.duration || 3}" min="1" style="width: 40px;">
                        TURNS
                    </div>
                `;
                break;
        }
        
        return `<div class="builder-item">${content}<button class="btn btn-sm btn-danger remove-builder-item"><i class="fas fa-times"></i></button></div>`;
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
    
    // Validate required fields
    if (!nameInput.value.trim()) {
        alert('Character name is required!');
        nameInput.focus();
        return;
    }
    
    if (isNaN(hpInput.value) || hpInput.value <= 0) {
        alert('HP must be a positive number!');
        hpInput.focus();
        return;
    }
    
    if (isNaN(atkInput.value) || atkInput.value <= 0) {
        alert('Attack must be a positive number!');
        atkInput.focus();
        return;
    }
    
    // Collect evolutions
    const evolutions = [];
    document.querySelectorAll('#char-evolutions .evolution-item').forEach(item => {
        const targetId = item.querySelector('.character-select').value;
        const requirements = item.querySelector('.evolution-requirements').value;
        
        if (targetId) {
            evolutions.push({ targetId, requirements });
        }
    });
    
    const charData = {
        id: character?.id || Date.now().toString(),
        name: nameInput.value.trim(),
        title: titleInput?.value.trim() || '',
        rarity: raritySelect.value,
        factionId: factionSelect?.value || '',
        description: descriptionTextarea?.value || '',
        image: imagePreview?.src || '',
        animationType: document.getElementById('char-animation-type')?.value || 'static',
        spritesheet: {
            image: document.getElementById('spritesheet-preview')?.src || '',
            framesPerRow: parseInt(document.getElementById('spritesheet-frames-row')?.value) || 4,
            totalFrames: parseInt(document.getElementById('spritesheet-total-frames')?.value) || 16,
            speed: parseInt(document.getElementById('spritesheet-speed')?.value) || 10
        },
        frameByFrame: {
            frames: [
                document.getElementById('frame1-preview')?.src || '',
                document.getElementById('frame2-preview')?.src || '',
                document.getElementById('frame3-preview')?.src || ''
            ],
            speed: parseInt(document.getElementById('framebyframe-speed')?.value) || 10
        },
        stats: {
            hp: parseInt(hpInput.value) || 100,
            attack: parseInt(atkInput.value) || 10,
            defense: parseInt(defInput.value) || 5,
            speed: parseInt(spdInput.value) || 5
        },
        abilities: {},
        evolutions: evolutions
    };
    
    // Save abilities
    ['basic', 'skill', 'ultimate', 'passive', 'leader'].forEach(type => {
        const select = document.getElementById(`char-ability-${type}`);
        if (select && select.value) {
            const ability = gameData.skills.find(s => s.id === select.value);
            if (ability) {
                charData.abilities[type] = {
                    id: ability.id,
                    name: ability.name,
                    element: ability.element,
                    damage: ability.damage,
                    description: ability.description,
                    animation: ability.animation
                };
                
                // Save ability builder data for passive and leader abilities
                if ((type === 'passive' || type === 'leader') && ability.builder) {
                    charData.abilities[type].builder = ability.builder;
                }
            }
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
    
    // Show success message
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
            <label>Ability Name *</label>
            <input type="text" id="ability-name" placeholder="Enter ability name" required>
        </div>
        
        <div class="form-group">
            <label>Element *</label>
            <select id="ability-element" required>
                ${gameData.system.elements.map(element => 
                    `<option value="${element}">${element}</option>`
                ).join('')}
            </select>
        </div>
        
        ${abilityType !== 'passive' && abilityType !== 'leader' ? `
        <div class="form-group">
            <label>Base Damage *</label>
            <input type="number" id="ability-damage" value="100" min="0" required>
        </div>
        ` : ''}
        
        <div class="form-group">
            <label>Description</label>
            <textarea id="ability-desc" rows="3"></textarea>
        </div>
        
        ${abilityType !== 'passive' && abilityType !== 'leader' ? `
        <div class="form-section">
            <h4>Animation</h4>
            
            <div class="form-group">
                <label>Animation Type</label>
                <select id="ability-animation-type">
                    <option value="static">Static Image</option>
                    <option value="spritesheet">Spritesheet Animation</option>
                    <option value="frame-by-frame">Frame-by-Frame</option>
                </select>
            </div>
            
            <div id="ability-animation-options">
                <div class="form-group">
                    <label>Animation Image</label>
                    <div class="drop-zone" id="ability-anim-drop">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drag & Drop animation file (GIF/PNG)</p>
                        <p>or click to select</p>
                        <input type="file" id="ability-anim-input" accept="image/*" style="display: none;">
                    </div>
                    <img id="ability-anim-preview" class="image-preview" alt="Animation Preview">
                </div>
            </div>
        </div>
        ` : ''}
        
        ${abilityType === 'passive' || abilityType === 'leader' ? `
        <div class="form-section">
            <h4>${abilityType.charAt(0).toUpperCase() + abilityType.slice(1)} Ability Builder</h4>
            <p>Build your ability by dragging and dropping conditions and effects</p>
            
            <div class="ability-builder-container" style="min-height: 150px; border: 1px dashed var(--gray); border-radius: 5px; padding: 10px; margin-bottom: 15px;">
                <p>Drag & drop conditions here to build your ${abilityType} ability</p>
            </div>
            
            <div class="ability-builder-palette" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="character-in-team">
                    <i class="fas fa-users"></i> Character in Team
                </div>
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="character-as-leader">
                    <i class="fas fa-crown"></i> Character as Leader
                </div>
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="team-size">
                    <i class="fas fa-layer-group"></i> Team Size
                </div>
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="rarity">
                    <i class="fas fa-star"></i> Character Rarity
                </div>
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="faction">
                    <i class="fas fa-shield-alt"></i> Character Faction
                </div>
                <div class="builder-palette-item" draggable="true" data-type="condition" data-value="element">
                    <i class="fas fa-fire"></i> Character Element
                </div>
                <div class="builder-palette-item" draggable="true" data-type="effect" data-value="stat-bonus">
                    <i class="fas fa-plus-circle"></i> Stat Bonus
                </div>
                <div class="builder-palette-item" draggable="true" data-type="effect" data-value="transform">
                    <i class="fas fa-sync-alt"></i> Transform Unit
                </div>
                <div class="builder-palette-item" draggable="true" data-type="effect" data-value="effect">
                    <i class="fas fa-bolt"></i> Apply Effect
                </div>
            </div>
            
            <div class="form-group">
                <label>Ability Description (Auto-generated)</label>
                <textarea id="ability-desc-auto" rows="3" readonly></textarea>
            </div>
        </div>
        ` : ''}
        
        <div class="form-actions" style="margin-top: 20px;">
            <button class="btn btn-primary" id="save-ability">
                <i class="fas fa-save"></i> Save Ability
            </button>
            <button class="btn btn-secondary" id="cancel-ability">Cancel</button>
        </div>
    `;
    
    // Setup image upload for animation
    if (abilityType !== 'passive' && abilityType !== 'leader') {
        setupImageUpload('ability-anim-drop', 'ability-anim-input', 'ability-anim-preview');
        
        // Animation type change
        document.getElementById('ability-animation-type').addEventListener('change', function() {
            const animationType = this.value;
            const optionsContainer = document.getElementById('ability-animation-options');
            
            if (animationType === 'static') {
                optionsContainer.innerHTML = `
                    <div class="form-group">
                        <label>Animation Image</label>
                        <div class="drop-zone" id="ability-anim-drop">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag & Drop animation file (GIF/PNG)</p>
                            <p>or click to select</p>
                            <input type="file" id="ability-anim-input" accept="image/*" style="display: none;">
                        </div>
                        <img id="ability-anim-preview" class="image-preview" alt="Animation Preview">
                    </div>
                `;
                setupImageUpload('ability-anim-drop', 'ability-anim-input', 'ability-anim-preview');
            } else if (animationType === 'spritesheet') {
                optionsContainer.innerHTML = `
                    <div class="form-group">
                        <label>Spritesheet Image</label>
                        <div class="drop-zone" id="ability-spritesheet-drop">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag & Drop spritesheet image here</p>
                            <p>or click to select</p>
                            <input type="file" id="ability-spritesheet-input" accept="image/*" style="display: none;">
                        </div>
                        <img id="ability-spritesheet-preview" class="image-preview" alt="Spritesheet Preview">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Frames per Row</label>
                            <input type="number" id="ability-spritesheet-frames-row" value="4" min="1">
                        </div>
                        <div class="form-group">
                            <label>Total Frames</label>
                            <input type="number" id="ability-spritesheet-total-frames" value="16" min="1">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Animation Speed</label>
                        <input type="range" id="ability-spritesheet-speed" min="1" max="30" value="10">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--gray);">
                            <span>Slow</span>
                            <span>Medium</span>
                            <span>Fast</span>
                        </div>
                    </div>
                `;
                setupImageUpload('ability-spritesheet-drop', 'ability-spritesheet-input', 'ability-spritesheet-preview');
            } else if (animationType === 'frame-by-frame') {
                optionsContainer.innerHTML = `
                    <div class="form-group">
                        <label>Frame 1</label>
                        <div class="drop-zone" id="ability-frame1-drop">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag & Drop frame image here</p>
                            <p>or click to select</p>
                            <input type="file" id="ability-frame1-input" accept="image/*" style="display: none;">
                        </div>
                        <img id="ability-frame1-preview" class="image-preview" alt="Frame 1 Preview">
                    </div>
                    
                    <div class="form-group">
                        <label>Frame 2</label>
                        <div class="drop-zone" id="ability-frame2-drop">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag & Drop frame image here</p>
                            <p>or click to select</p>
                            <input type="file" id="ability-frame2-input" accept="image/*" style="display: none;">
                        </div>
                        <img id="ability-frame2-preview" class="image-preview" alt="Frame 2 Preview">
                    </div>
                    
                    <div class="form-group">
                        <label>Frame 3</label>
                        <div class="drop-zone" id="ability-frame3-drop">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag & Drop frame image here</p>
                            <p>or click to select</p>
                            <input type="file" id="ability-frame3-input" accept="image/*" style="display: none;">
                        </div>
                        <img id="ability-frame3-preview" class="image-preview" alt="Frame 3 Preview">
                    </div>
                    
                    <div class="form-group">
                        <label>Animation Speed</label>
                        <input type="range" id="ability-framebyframe-speed" min="1" max="30" value="10">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--gray);">
                            <span>Slow</span>
                            <span>Medium</span>
                            <span>Fast</span>
                        </div>
                    </div>
                `;
                setupImageUpload('ability-frame1-drop', 'ability-frame1-input', 'ability-frame1-preview');
                setupImageUpload('ability-frame2-drop', 'ability-frame2-input', 'ability-frame2-preview');
                setupImageUpload('ability-frame3-drop', 'ability-frame3-input', 'ability-frame3-preview');
            }
        });
    }
    
    // Setup ability builder for passive and leader abilities
    if (abilityType === 'passive' || abilityType === 'leader') {
        setupAbilityBuilder();
    }
    
    // Save ability
    const saveBtn = document.getElementById('save-ability');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const name = document.getElementById('ability-name')?.value?.trim() || '';
            const element = document.getElementById('ability-element')?.value || 'neutral';
            
            if (!name) {
                alert('Ability name is required!');
                return;
            }
            
            if (abilityType !== 'passive' && abilityType !== 'leader') {
                const damage = parseInt(document.getElementById('ability-damage')?.value) || 100;
                const description = document.getElementById('ability-desc')?.value || '';
                
                let animation = '';
                const animationType = document.getElementById('ability-animation-type')?.value || 'static';
                
                if (animationType === 'static') {
                    animation = document.getElementById('ability-anim-preview')?.src || '';
                } else if (animationType === 'spritesheet') {
                    const framesPerRow = parseInt(document.getElementById('ability-spritesheet-frames-row')?.value) || 4;
                    const totalFrames = parseInt(document.getElementById('ability-spritesheet-total-frames')?.value) || 16;
                    const speed = parseInt(document.getElementById('ability-spritesheet-speed')?.value) || 10;
                    const image = document.getElementById('ability-spritesheet-preview')?.src || '';
                    
                    animation = {
                        type: 'spritesheet',
                        image: image,
                        framesPerRow: framesPerRow,
                        totalFrames: totalFrames,
                        speed: speed
                    };
                } else if (animationType === 'frame-by-frame') {
                    const frame1 = document.getElementById('ability-frame1-preview')?.src || '';
                    const frame2 = document.getElementById('ability-frame2-preview')?.src || '';
                    const frame3 = document.getElementById('ability-frame3-preview')?.src || '';
                    const speed = parseInt(document.getElementById('ability-framebyframe-speed')?.value) || 10;
                    
                    animation = {
                        type: 'frame-by-frame',
                        frames: [frame1, frame2, frame3],
                        speed: speed
                    };
                }
                
                const abilityData = {
                    id: Date.now().toString(),
                    name: name,
                    type: abilityType,
                    element: element,
                    damage: damage,
                    description: description,
                    animation: animation
                };
                
                gameData.skills.push(abilityData);
                
                // Close the modal
                modal.style.display = 'none';
                
                // Refresh the character editor to show the new ability
                if (character) {
                    openCharacterEditor(character);
                }
            } else {
                // For passive and leader abilities
                const description = document.getElementById('ability-desc')?.value || '';
                const autoDesc = document.getElementById('ability-desc-auto')?.value || '';
                
                // Get builder data
                const conditions = [];
                document.querySelectorAll('.ability-builder-container .builder-item').forEach(item => {
                    const index = item.querySelector('.condition-item, .effect-item')?.dataset.index;
                    const type = item.querySelector('[data-type]')?.dataset.value;
                    
                    if (type) {
                        let condition = { type: type };
                        
                        switch(type) {
                            case 'character-in-team':
                            case 'character-as-leader':
                            case 'rarity':
                            case 'faction':
                            case 'element':
                                condition.characterId = item.querySelector('.character-select')?.value;
                                if (type === 'rarity') condition.rarity = item.querySelector('.rarity-select')?.value;
                                if (type === 'faction') condition.factionId = item.querySelector('.faction-select')?.value;
                                if (type === 'element') condition.element = item.querySelector('.element-select')?.value;
                                break;
                            case 'team-size':
                                condition.operator = item.querySelector('.operator')?.value;
                                condition.value = item.querySelector('.value')?.value;
                                break;
                            case 'stat-bonus':
                                condition.stat = item.querySelector('.stat-select')?.value;
                                condition.value = item.querySelector('.bonus-value')?.value;
                                break;
                            case 'transform':
                                condition.targetId = item.querySelector('.character-select')?.value;
                                break;
                            case 'effect':
                                condition.effect = item.querySelector('.effect-select')?.value;
                                condition.duration = item.querySelector('.duration')?.value;
                                break;
                        }
                        
                        conditions.push(condition);
                    }
                });
                
                const abilityData = {
                    id: Date.now().toString(),
                    name: name,
                    type: abilityType,
                    element: element,
                    description: description || autoDesc,
                    builder: {
                        conditions: conditions
                    }
                };
                
                gameData.skills.push(abilityData);
                
                // Close the modal
                modal.style.display = 'none';
                
                // Refresh the character editor to show the new ability
                if (character) {
                    openCharacterEditor(character);
                }
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

// Setup ability builder for passive and leader abilities
function setupAbilityBuilder() {
    const builderContainer = document.querySelector('.ability-builder-container');
    const paletteItems = document.querySelectorAll('.builder-palette-item');
    
    // Make palette items draggable
    paletteItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.value);
            e.dataTransfer.setData('type', this.dataset.type);
            this.classList.add('dragging');
        });
        
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    // Set up drop zone
    builderContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--info)';
    });
    
    builderContainer.addEventListener('dragleave', function() {
        this.style.borderColor = 'var(--gray)';
    });
    
    builderContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--gray)';
        
        const type = e.dataTransfer.getData('type');
        const value = e.dataTransfer.getData('text/plain');
        
        if (!value) return;
        
        // Create new builder item based on type and value
        const newItem = document.createElement('div');
        newItem.className = 'builder-item';
        
        let content = '';
        
        switch(value) {
            case 'character-in-team':
                content = `
                    <div class="condition-item">
                        <strong>IF</strong> 
                        <select class="character-select">
                            <option value="">Select character</option>
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}">${c.name}</option>`
                            ).join('')}
                        </select>
                        IN TEAM
                    </div>
                `;
                break;
            case 'character-as-leader':
                content = `
                    <div class="condition-item">
                        <strong>IF</strong> 
                        <select class="character-select">
                            <option value="">Select character</option>
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}">${c.name}</option>`
                            ).join('')}
                        </select>
                        AS LEADER
                    </div>
                `;
                break;
            case 'team-size':
                content = `
                    <div class="condition-item">
                        <strong>IF</strong> TEAM SIZE 
                        <select class="operator">
                            <option value="==">=</option>
                            <option value=">=">&ge;</option>
                            <option value="<=">&le;</option>
                        </select>
                        <input type="number" class="value" value="3" min="1" style="width: 40px;">
                    </div>
                `;
                break;
            case 'rarity':
                content = `
                    <div class="condition-item">
                        <strong>IF</strong> 
                        <select class="character-select">
                            <option value="">Select character</option>
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}">${c.name}</option>`
                            ).join('')}
                        </select>
                        RARITY IS 
                        <select class="rarity-select">
                            ${gameData.system.rarities.map(r => 
                                `<option value="${r}">${r}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                break;
            case 'faction':
                content = `
                    <div class="condition-item">
                        <strong>IF</strong> 
                        <select class="character-select">
                            <option value="">Select character</option>
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}">${c.name}</option>`
                            ).join('')}
                        </select>
                        BELONGS TO 
                        <select class="faction-select">
                            ${gameData.factions.map(f => 
                                `<option value="${f.id}">${f.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                break;
            case 'element':
                content = `
                    <div class="condition-item">
                        <strong>IF</strong> 
                        <select class="character-select">
                            <option value="">Select character</option>
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}">${c.name}</option>`
                            ).join('')}
                        </select>
                        ELEMENT IS 
                        <select class="element-select">
                            ${gameData.system.elements.map(e => 
                                `<option value="${e}">${e}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                break;
            case 'stat-bonus':
                content = `
                    <div class="effect-item">
                        ADD 
                        <input type="number" class="bonus-value" value="10" min="1" max="100" style="width: 50px;">
                        % TO 
                        <select class="stat-select">
                            <option value="atk">ATK</option>
                            <option value="def">DEF</option>
                            <option value="hp">HP</option>
                            <option value="spd">SPD</option>
                        </select>
                    </div>
                `;
                break;
            case 'transform':
                content = `
                    <div class="effect-item">
                        TRANSFORM INTO 
                        <select class="character-select">
                            <option value="">Select character</option>
                            ${gameData.characters.map(c => 
                                `<option value="${c.id}">${c.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                break;
            case 'effect':
                content = `
                    <div class="effect-item">
                        APPLY 
                        <select class="effect-select">
                            <option value="buff">Buff</option>
                            <option value="debuff">Debuff</option>
                            <option value="heal">Heal</option>
                        </select>
                        FOR 
                        <input type="number" class="duration" value="3" min="1" style="width: 40px;">
                        TURNS
                    </div>
                `;
                break;
        }
        
        newItem.innerHTML = `
            ${content}
            <button class="btn btn-sm btn-danger remove-builder-item">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to container
        this.innerHTML = '';
        this.appendChild(newItem);
        
        // Add remove event
        newItem.querySelector('.remove-builder-item').addEventListener('click', function() {
            this.closest('.builder-item').remove();
            if (builderContainer.children.length === 0) {
                builderContainer.innerHTML = '<p>Drag & drop conditions here</p>';
            }
        });
        
        // Update auto-generated description
        updateAbilityDescription();
    });
    
    // Add event listener for reset button
    document.getElementById('reset-passive-builder')?.addEventListener('click', function() {
        builderContainer.innerHTML = '<p>Drag & drop conditions here</p>';
        updateAbilityDescription();
    });
    
    // Add event listener for any changes to update description
    builderContainer.addEventListener('change', updateAbilityDescription);
    builderContainer.addEventListener('input', updateAbilityDescription);
}

// Update ability description based on builder
function updateAbilityDescription() {
    const descriptionElement = document.getElementById('ability-desc-auto');
    if (!descriptionElement) return;
    
    const container = document.querySelector('.ability-builder-container');
    if (!container || container.children.length === 0) {
        descriptionElement.value = '';
        return;
    }
    
    let description = '';
    
    // Process each condition
    document.querySelectorAll('.condition-item').forEach((cond, index) => {
        if (index > 0) description += ' AND ';
        
        const characterSelect = cond.querySelector('.character-select');
        const characterName = characterSelect ? gameData.characters.find(c => c.id === characterSelect.value)?.name : '';
        
        switch(cond.dataset.value) {
            case 'character-in-team':
                description += characterName ? `${characterName} in team` : 'Character in team';
                break;
            case 'character-as-leader':
                description += characterName ? `${characterName} as leader` : 'Character as leader';
                break;
            case 'team-size':
                const operator = cond.querySelector('.operator')?.value;
                const value = cond.querySelector('.value')?.value;
                description += `Team size ${operator} ${value}`;
                break;
            case 'rarity':
                const rarity = cond.querySelector('.rarity-select')?.value;
                description += characterName ? `${characterName} is ${rarity}` : 'Character is ${rarity}';
                break;
            case 'faction':
                const factionId = cond.querySelector('.faction-select')?.value;
                const faction = gameData.factions.find(f => f.id === factionId);
                description += characterName ? `${characterName} belongs to ${faction?.name}` : 'Character belongs to faction';
                break;
            case 'element':
                const element = cond.querySelector('.element-select')?.value;
                description += characterName ? `${characterName} is ${element}` : 'Character is element';
                break;
        }
    });
    
    // Process effects
    const effects = [];
    document.querySelectorAll('.effect-item').forEach(effect => {
        const characterSelect = effect.querySelector('.character-select');
        const characterName = characterSelect ? gameData.characters.find(c => c.id === characterSelect.value)?.name : '';
        
        switch(effect.dataset.value) {
            case 'stat-bonus':
                const stat = effect.querySelector('.stat-select')?.value;
                const value = effect.querySelector('.bonus-value')?.value;
                effects.push(`${value}% ${stat.toUpperCase()}`);
                break;
            case 'transform':
                const targetId = effect.querySelector('.character-select')?.value;
                const target = gameData.characters.find(c => c.id === targetId);
                effects.push(`Transform into ${target?.name}`);
                break;
            case 'effect':
                const effectType = effect.querySelector('.effect-select')?.value;
                const duration = effect.querySelector('.duration')?.value;
                effects.push(`${effectType} for ${duration} turns`);
                break;
        }
    });
    
    if (effects.length > 0) {
        description += ' THEN ';
        description += effects.join(' AND ');
    }
    
    descriptionElement.value = description;
}

// Animation-related functions
function createAnimationProfile(characterId, animationName) {
    // Create an animation profile object for the character
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character) return;
    
    // Initialize animation data structure
    if (!character.animations) {
        character.animations = {};
    }
    
    // Add new animation profile
    character.animations[animationName] = {
        name: animationName,
        type: '', // 'spritesheet', 'frame-by-frame'
        frames: [], // array of frame objects
        speed: 10, // frames per second
        loop: true // whether to loop the animation
    };
    
    saveDatabase();
}

function addFrameToAnimation(characterId, animationName, frameData) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character || !character.animations[animationName]) return;
    
    // Add frame to animation
    character.animations[animationName].frames.push(frameData);
    
    saveDatabase();
}

function updateFrameInAnimation(characterId, animationName, frameIndex, updatedFrame) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character || !character.animations[animationName]) return;
    
    // Update specific frame
    if (character.animations[animationName].frames[frameIndex]) {
        character.animations[animationName].frames[frameIndex] = updatedFrame;
    }
    
    saveDatabase();
}

function removeFrameFromAnimation(characterId, animationName, frameIndex) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character || !character.animations[animationName]) return;
    
    // Remove frame from animation
    character.animations[animationName].frames.splice(frameIndex, 1);
    
    saveDatabase();
}

function setAnimationSpeed(characterId, animationName, speed) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character || !character.animations[animationName]) return;
    
    // Update animation speed
    character.animations[animationName].speed = speed;
    
    saveDatabase();
}

function setAnimationLoop(characterId, animationName, loop) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character || !character.animations[animationName]) return;
    
    // Update animation loop setting
    character.animations[animationName].loop = loop;
    
    saveDatabase();
}

// Relationship system functions
function createCharacterRelationshipTree(characterId) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character) return;
    
    // Initialize relationships tree structure
    if (!character.relationshipsTree) {
        character.relationshipsTree = {
            nodes: [], // array of node objects with id, name, image, type (like/dislike)
            edges: []  // array of edge objects connecting nodes
        };
    }
    
    saveDatabase();
}

function addCharacterToRelationshipTree(characterId, nodeId, nodeData) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character || !character.relationshipsTree) return;
    
    // Add new node to tree
    character.relationshipsTree.nodes.push({
        id: nodeId,
        name: nodeData.name,
        image: nodeData.image,
        type: nodeData.type, // 'like' or 'dislike'
        position: nodeData.position || { x: 0, y: 0 }
    });
    
    saveDatabase();
}

function addRelationshipEdge(characterId, fromNodeId, toNodeId, relationshipType, buffDebuff = null) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character || !character.relationshipsTree) return;
    
    // Add new edge between nodes
    character.relationshipsTree.edges.push({
        id: `${fromNodeId}-${toNodeId}`,
        from: fromNodeId,
        to: toNodeId,
        type: relationshipType, // 'like' or 'dislike'
        buffDebuff: buffDebuff || null
    });
    
    saveDatabase();
}

function updateRelationshipEdge(characterId, edgeId, updatedData) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character || !character.relationshipsTree) return;
    
    // Find and update specific edge
    const edgeIndex = character.relationshipsTree.edges.findIndex(e => e.id === edgeId);
    if (edgeIndex !== -1) {
        Object.assign(character.relationshipsTree.edges[edgeIndex], updatedData);
    }
    
    saveDatabase();
}

function removeRelationshipEdge(characterId, edgeId) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character || !character.relationshipsTree) return;
    
    // Remove specific edge
    character.relationshipsTree.edges = character.relationshipsTree.edges.filter(e => e.id !== edgeId);
    
    saveDatabase();
}

function updateCharacterNodePosition(characterId, nodeId, position) {
    const character = gameData.characters.find(c => c.id === characterId);
    if (!character || !character.relationshipsTree) return;
    
    // Find and update node position
    const nodeIndex = character.relationshipsTree.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
        character.relationshipsTree.nodes[nodeIndex].position = position;
    }
    
    saveDatabase();
}

// Export functions for use in other modules
window.createAnimationProfile = createAnimationProfile;
window.addFrameToAnimation = addFrameToAnimation;
window.updateFrameInAnimation = updateFrameInAnimation;
window.removeFrameFromAnimation = removeFrameFromAnimation;
window.setAnimationSpeed = setAnimationSpeed;
window.setAnimationLoop = setAnimationLoop;
window.createCharacterRelationshipTree = createCharacterRelationshipTree;
window.addCharacterToRelationshipTree = addCharacterToRelationshipTree;
window.addRelationshipEdge = addRelationshipEdge;
window.updateRelationshipEdge = updateRelationshipEdge;
window.removeRelationshipEdge = removeRelationshipEdge;
window.updateCharacterNodePosition = updateCharacterNodePosition;

// Initialize database when page loads
document.addEventListener('DOMContentLoaded', initDatabase);
