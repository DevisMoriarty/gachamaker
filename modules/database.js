// modules/database.js
class Database {
    constructor() {
        this.init();
        this.data = {
            characters: [],
            items: [],
            skills: [],
            factions: [],
            gatchaBanners: [],
            achievements: [],
            storyArcs: [],
            system: {
                currencies: [],
                levelCurves: []
            }
        };
        this.currentEditingId = null;
        this.currentEditingType = null;
        this.setupEventListeners();
        this.loadFromLocalStorage();
    }

    init() {
        // Create the database container
        this.container = document.createElement('div');
        this.container.id = 'database-module';
        this.container.className = 'module-container';
        
        this.container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Game Database</h2>
                    <p class="module-description">Manage all game data: characters, items, skills, and more</p>
                </div>
                <div class="database-actions">
                    <select id="database-category" class="btn btn-secondary">
                        <option value="characters">Characters</option>
                        <option value="items">Items</option>
                        <option value="skills">Skills</option>
                        <option value="factions">Factions & Elements</option>
                        <option value="gatcha">Gatcha Banners</option>
                        <option value="achievements">Achievements</option>
                        <option value="story">Story</option>
                        <option value="system">System</option>
                    </select>
                    <button id="new-item-btn" class="btn btn-primary">
                        <i class="fas fa-plus"></i> New Item
                    </button>
                    <button id="save-db-btn" class="btn btn-success">
                        <i class="fas fa-save"></i> Save
                    </button>
                </div>
            </div>
            <div class="database-content">
                <!-- Content will be dynamically generated based on category -->
            </div>
        `;
    }

    render() {
        const category = document.getElementById('database-category').value;
        const contentDiv = this.container.querySelector('.database-content');
        
        switch(category) {
            case 'characters':
                contentDiv.innerHTML = this.renderCharacters();
                this.setupCharactersUI();
                break;
            case 'items':
                contentDiv.innerHTML = this.renderItems();
                this.setupItemsUI();
                break;
            case 'skills':
                contentDiv.innerHTML = this.renderSkills();
                this.setupSkillsUI();
                break;
            case 'factions':
                contentDiv.innerHTML = this.renderFactions();
                this.setupFactionsUI();
                break;
            case 'gatcha':
                contentDiv.innerHTML = this.renderGatcha();
                this.setupGatchaUI();
                break;
            case 'achievements':
                contentDiv.innerHTML = this.renderAchievements();
                this.setupAchievementsUI();
                break;
            case 'story':
                contentDiv.innerHTML = this.renderStory();
                this.setupStoryUI();
                break;
            case 'system':
                contentDiv.innerHTML = this.renderSystem();
                this.setupSystemUI();
                break;
        }
    }

    // ======================
    // CHARACTER MANAGEMENT
    // ======================
    
    renderCharacters() {
        return `
            <div class="database-grid">
                <div class="database-list">
                    <div class="list-header">
                        <h3>Characters</h3>
                        <div class="search-container">
                            <input type="text" id="character-search" placeholder="Search characters...">
                        </div>
                    </div>
                    <div id="character-list" class="scrollable-list">
                        ${this.data.characters.map(char => `
                            <div class="database-item character-item" data-id="${char.id}">
                                <div class="item-thumbnail" style="background-image: url('${char.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2334495e"/><text x="50" y="50" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>'}"></div>
                                <div class="item-info">
                                    <div class="item-name">${char.name} <span class="rarity-tag ${char.rarity.toLowerCase()}">${char.rarity}</span></div>
                                    <div class="item-subtitle">${char.title || 'No title'}</div>
                                </div>
                                <div class="item-actions">
                                    <button class="btn-icon edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon delete-btn"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="database-detail">
                    <div id="character-detail-container">
                        <div class="empty-state">
                            <i class="fas fa-user-friends fa-3x"></i>
                            <h3>Select or Create a Character</h3>
                            <p>Click on a character in the list or create a new one to edit</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupCharactersUI() {
        // Setup search
        const searchInput = document.getElementById('character-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.character-item');
                
                items.forEach(item => {
                    const name = item.querySelector('.item-name').textContent.toLowerCase();
                    const title = item.querySelector('.item-subtitle').textContent.toLowerCase();
                    
                    if (name.includes(searchTerm) || title.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Setup item clicks
        document.querySelectorAll('.character-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-icon')) return;
                
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'characters';
                this.renderCharacterDetail(id);
            });
            
            // Edit button
            item.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'characters';
                this.renderCharacterDetail(id);
            });
            
            // Delete button
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this character?')) {
                    this.data.characters = this.data.characters.filter(c => c.id !== item.dataset.id);
                    this.render();
                    this.saveToLocalStorage();
                }
            });
        });
        
        // New character button
        document.getElementById('new-item-btn').onclick = () => {
            this.currentEditingId = null;
            this.currentEditingType = 'characters';
            this.renderCharacterDetail();
        };
    }
    
    renderCharacterDetail(id = null) {
        const character = id ? this.data.characters.find(c => c.id === id) : {
            id: Date.now().toString(),
            name: '',
            title: '',
            rarity: 'Common',
            faction: '',
            image: '',
            baseStats: {
                hp: 100,
                attack: 10,
                defense: 10,
                speed: 10
            },
            skills: {
                basic: null,
                skill: null,
                ultimate: null,
                ability: null,
                leader: null
            },
            description: '',
            connections: [],
            evolutions: []
        };
        
        const rarityOptions = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
        const factions = this.data.factions.map(f => f.name);
        
        document.getElementById('character-detail-container').innerHTML = `
            <div class="form-grid">
                <div class="form-section">
                    <h3>Character Basics</h3>
                    <div class="form-group">
                        <label>Character Image</label>
                        <div class="image-upload-container">
                            <div id="character-image-preview" class="image-preview" style="background-image: url('${character.image || ''}')">
                                ${!character.image ? '<div class="image-placeholder">Drag & drop or click to upload</div>' : ''}
                            </div>
                            <input type="file" id="character-image-upload" accept="image/*" style="display: none;">
                            <button class="btn btn-secondary" id="upload-character-image">
                                <i class="fas fa-upload"></i> Upload Image
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="character-name" value="${character.name}" placeholder="Character name">
                    </div>
                    <div class="form-group">
                        <label>Title (Optional)</label>
                        <input type="text" id="character-title" value="${character.title || ''}" placeholder="Character title">
                    </div>
                    <div class="form-group">
                        <label>Rarity</label>
                        <select id="character-rarity">
                            ${rarityOptions.map(r => `<option value="${r}" ${character.rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Faction</label>
                        <select id="character-faction">
                            <option value="">None</option>
                            ${factions.map(f => `<option value="${f}" ${character.faction === f ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Base Stats</h3>
                    <div class="stats-grid">
                        <div class="form-group">
                            <label>HP</label>
                            <input type="number" id="stat-hp" value="${character.baseStats.hp}" min="1">
                        </div>
                        <div class="form-group">
                            <label>Attack</label>
                            <input type="number" id="stat-attack" value="${character.baseStats.attack}" min="1">
                        </div>
                        <div class="form-group">
                            <label>Defense</label>
                            <input type="number" value="${character.baseStats.defense}" id="stat-defense" min="1">
                        </div>
                        <div class="form-group">
                            <label>Speed</label>
                            <input type="number" value="${character.baseStats.speed}" id="stat-speed" min="1">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Skills & Abilities</h3>
                    <div class="form-group">
                        <label>Basic Attack</label>
                        <div class="skill-selector">
                            <select id="skill-basic">
                                <option value="">Select Skill</option>
                                ${this.data.skills.map(s => `<option value="${s.id}" ${character.skills.basic === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                            </select>
                            <button class="btn-icon" id="create-basic-skill"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Skill</label>
                        <div class="skill-selector">
                            <select id="skill-skill">
                                <option value="">Select Skill</option>
                                ${this.data.skills.map(s => `<option value="${s.id}" ${character.skills.skill === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                            </select>
                            <button class="btn-icon" id="create-skill"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Ultimate</label>
                        <div class="skill-selector">
                            <select id="skill-ultimate">
                                <option value="">Select Skill</option>
                                ${this.data.skills.map(s => `<option value="${s.id}" ${character.skills.ultimate === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                            </select>
                            <button class="btn-icon" id="create-ultimate"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Ability</label>
                        <div class="skill-selector">
                            <select id="skill-ability">
                                <option value="">Select Skill</option>
                                ${this.data.skills.map(s => `<option value="${s.id}" ${character.skills.ability === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                            </select>
                            <button class="btn-icon" id="create-ability"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Leader Ability</label>
                        <div class="skill-selector">
                            <select id="skill-leader">
                                <option value="">Select Skill</option>
                                ${this.data.skills.map(s => `<option value="${s.id}" ${character.skills.leader === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                            </select>
                            <button class="btn-icon" id="create-leader"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Description & Connections</h3>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="character-description" rows="4" placeholder="Character description">${character.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Character Connections</label>
                        <div class="connections-container">
                            ${character.connections.map(conn => `
                                <div class="connection-item" data-target="${conn.targetId}">
                                    <select class="connection-type">
                                        <option value="likes" ${conn.type === 'likes' ? 'selected' : ''}>Likes</option>
                                        <option value="dislikes" ${conn.type === 'dislikes' ? 'selected' : ''}>Dislikes</option>
                                        <option value="team-bonus" ${conn.type === 'team-bonus' ? 'selected' : ''}>Team Bonus</option>
                                    </select>
                                    <select class="connection-target">
                                        ${this.data.characters.filter(c => c.id !== character.id).map(c => `
                                            <option value="${c.id}" ${conn.targetId === c.id ? 'selected' : ''}>${c.name}</option>
                                        `).join('')}
                                    </select>
                                    <input type="text" class="connection-effect" value="${conn.effect || ''}" placeholder="Effect">
                                    <button class="btn-icon remove-connection"><i class="fas fa-trash"></i></button>
                                </div>
                            `).join('')}
                            <button id="add-connection" class="btn btn-secondary"><i class="fas fa-plus"></i> Add Connection</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Evolutions</label>
                        <div class="evolutions-container">
                            ${character.evolutions.map(evo => `
                                <div class="evolution-item" data-target="${evo.targetId}">
                                    <select class="evolution-target">
                                        ${this.data.characters.filter(c => c.id !== character.id).map(c => `
                                            <option value="${c.id}" ${evo.targetId === c.id ? 'selected' : ''}>${c.name}</option>
                                        `).join('')}
                                    </select>
                                    <input type="text" class="evolution-requirement" value="${evo.requirement || ''}" placeholder="Requirements">
                                    <button class="btn-icon remove-evolution"><i class="fas fa-trash"></i></button>
                                </div>
                            `).join('')}
                            <button id="add-evolution" class="btn btn-secondary"><i class="fas fa-plus"></i> Add Evolution</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button id="save-character" class="btn btn-success">
                    <i class="fas fa-save"></i> ${id ? 'Save Changes' : 'Create Character'}
                </button>
                ${id ? `
                <button id="delete-character" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Delete Character
                </button>
                ` : ''}
            </div>
        `;
        
        // Setup image upload
        const imagePreview = document.getElementById('character-image-preview');
        const imageUpload = document.getElementById('character-image-upload');
        const uploadButton = document.getElementById('upload-character-image');
        
        imagePreview.addEventListener('click', () => imageUpload.click());
        uploadButton.addEventListener('click', () => imageUpload.click());
        
        imageUpload.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    imagePreview.style.backgroundImage = `url('${event.target.result}')`;
                    imagePreview.querySelector('.image-placeholder')?.remove();
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        // Setup connection and evolution buttons
        document.getElementById('add-connection').addEventListener('click', () => {
            const connectionsContainer = document.querySelector('.connections-container');
            const characterOptions = this.data.characters
                .filter(c => c.id !== character.id)
                .map(c => `<option value="${c.id}">${c.name}</option>`)
                .join('');
            
            const newItem = document.createElement('div');
            newItem.className = 'connection-item';
            newItem.innerHTML = `
                <select class="connection-type">
                    <option value="likes">Likes</option>
                    <option value="dislikes">Dislikes</option>
                    <option value="team-bonus">Team Bonus</option>
                </select>
                <select class="connection-target">
                    ${characterOptions}
                </select>
                <input type="text" class="connection-effect" placeholder="Effect">
                <button class="btn-icon remove-connection"><i class="fas fa-trash"></i></button>
            `;
            
            connectionsContainer.insertBefore(newItem, document.getElementById('add-connection'));
            
            // Setup remove button
            newItem.querySelector('.remove-connection').addEventListener('click', () => {
                newItem.remove();
            });
        });
        
        document.getElementById('add-evolution').addEventListener('click', () => {
            const evolutionsContainer = document.querySelector('.evolutions-container');
            const characterOptions = this.data.characters
                .filter(c => c.id !== character.id)
                .map(c => `<option value="${c.id}">${c.name}</option>`)
                .join('');
            
            const newItem = document.createElement('div');
            newItem.className = 'evolution-item';
            newItem.innerHTML = `
                <select class="evolution-target">
                    ${characterOptions}
                </select>
                <input type="text" class="evolution-requirement" placeholder="Requirements">
                <button class="btn-icon remove-evolution"><i class="fas fa-trash"></i></button>
            `;
            
            evolutionsContainer.insertBefore(newItem, document.getElementById('add-evolution'));
            
            // Setup remove button
            newItem.querySelector('.remove-evolution').addEventListener('click', () => {
                newItem.remove();
            });
        });
        
        // Setup remove connection buttons
        document.querySelectorAll('.remove-connection').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.target.closest('.connection-item').remove();
            });
        });
        
        // Setup remove evolution buttons
        document.querySelectorAll('.remove-evolution').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.target.closest('.evolution-item').remove();
            });
        });
        
        // Setup skill creation buttons
        document.getElementById('create-basic-skill').addEventListener('click', () => this.openSkillModal('basic'));
        document.getElementById('create-skill').addEventListener('click', () => this.openSkillModal('skill'));
        document.getElementById('create-ultimate').addEventListener('click', () => this.openSkillModal('ultimate'));
        document.getElementById('create-ability').addEventListener('click', () => this.openSkillModal('ability'));
        document.getElementById('create-leader').addEventListener('click', () => this.openSkillModal('leader'));
        
        // Setup save button
        document.getElementById('save-character').addEventListener('click', () => {
            const updatedCharacter = {
                id: character.id,
                name: document.getElementById('character-name').value,
                title: document.getElementById('character-title').value,
                rarity: document.getElementById('character-rarity').value,
                faction: document.getElementById('character-faction').value,
                image: imagePreview.style.backgroundImage.replace('url("', '').replace('")', '').replace('url(', '').replace(')', ''),
                baseStats: {
                    hp: parseInt(document.getElementById('stat-hp').value) || 100,
                    attack: parseInt(document.getElementById('stat-attack').value) || 10,
                    defense: parseInt(document.getElementById('stat-defense').value) || 10,
                    speed: parseInt(document.getElementById('stat-speed').value) || 10
                },
                skills: {
                    basic: document.getElementById('skill-basic').value || null,
                    skill: document.getElementById('skill-skill').value || null,
                    ultimate: document.getElementById('skill-ultimate').value || null,
                    ability: document.getElementById('skill-ability').value || null,
                    leader: document.getElementById('skill-leader').value || null
                },
                description: document.getElementById('character-description').value,
                connections: Array.from(document.querySelectorAll('.connection-item')).map(item => ({
                    type: item.querySelector('.connection-type').value,
                    targetId: item.querySelector('.connection-target').value,
                    effect: item.querySelector('.connection-effect').value
                })),
                evolutions: Array.from(document.querySelectorAll('.evolution-item')).map(item => ({
                    targetId: item.querySelector('.evolution-target').value,
                    requirement: item.querySelector('.evolution-requirement').value
                }))
            };
            
            if (id) {
                // Update existing character
                const index = this.data.characters.findIndex(c => c.id === id);
                this.data.characters[index] = updatedCharacter;
            } else {
                // Add new character
                this.data.characters.push(updatedCharacter);
            }
            
            this.saveToLocalStorage();
            this.render();
        });
        
        // Setup delete button if editing
        if (id) {
            document.getElementById('delete-character').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this character?')) {
                    this.data.characters = this.data.characters.filter(c => c.id !== id);
                    this.saveToLocalStorage();
                    this.render();
                }
            });
        }
    }
    
    openSkillModal(skillType) {
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        
        modalBackdrop.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Create New Skill</h3>
                    <button class="btn-icon close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Skill Name</label>
                        <input type="text" id="skill-name" placeholder="Skill name">
                    </div>
                    <div class="form-group">
                        <label>Base Damage</label>
                        <input type="number" id="skill-damage" value="50" min="1">
                    </div>
                    <div class="form-group">
                        <label>Element</label>
                        <select id="skill-element">
                            <option value="None">None</option>
                            ${this.data.factions.map(f => `<option value="${f.name}">${f.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Animation</label>
                        <div class="animation-preview">
                            <div class="animation-selector">
                                <div class="animation-option active" data-animation="slash">
                                    <i class="fas fa-slash"></i>
                                    <span>Slash</span>
                                </div>
                                <div class="animation-option" data-animation="fire">
                                    <i class="fas fa-fire"></i>
                                    <span>Fire</span>
                                </div>
                                <div class="animation-option" data-animation="ice">
                                    <i class="fas fa-snowflake"></i>
                                    <span>Ice</span>
                                </div>
                                <div class="animation-option" data-animation="lightning">
                                    <i class="fas fa-bolt"></i>
                                    <span>Lightning</span>
                                </div>
                            </div>
                            <div class="animation-preview-area">
                                <!-- Preview will be shown here -->
                                <div class="animation-preview-content slash"></div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="skill-description" rows="3" placeholder="Skill description"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancel</button>
                    <button id="save-skill" class="btn btn-success">Save Skill</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalBackdrop);
        
        // Setup animation selection
        const animationOptions = modalBackdrop.querySelectorAll('.animation-option');
        const previewContent = modalBackdrop.querySelector('.animation-preview-content');
        
        animationOptions.forEach(option => {
            option.addEventListener('click', () => {
                animationOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                previewContent.className = 'animation-preview-content ' + option.dataset.animation;
            });
        });
        
        // Setup close buttons
        const closeButtons = modalBackdrop.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modalBackdrop);
            });
        });
        
        // Setup save button
        modalBackdrop.querySelector('#save-skill').addEventListener('click', () => {
            const newSkill = {
                id: Date.now().toString(),
                name: document.getElementById('skill-name').value,
                damage: parseInt(document.getElementById('skill-damage').value) || 50,
                element: document.getElementById('skill-element').value,
                animation: document.querySelector('.animation-option.active').dataset.animation,
                description: document.getElementById('skill-description').value
            };
            
            this.data.skills.push(newSkill);
            this.saveToLocalStorage();
            
            // Update the skill selector in the character form
            const selectId = `skill-${skillType}`;
            const select = document.getElementById(selectId);
            const option = document.createElement('option');
            option.value = newSkill.id;
            option.textContent = newSkill.name;
            select.appendChild(option);
            select.value = newSkill.id;
            
            document.body.removeChild(modalBackdrop);
        });
    }
    
    // =================
    // ITEM MANAGEMENT
    // =================
    
    renderItems() {
        return `
            <div class="database-grid">
                <div class="database-list">
                    <div class="list-header">
                        <h3>Items</h3>
                        <div class="search-container">
                            <input type="text" id="item-search" placeholder="Search items...">
                        </div>
                    </div>
                    <div id="item-list" class="scrollable-list">
                        ${this.data.items.map(item => `
                            <div class="database-item item-item" data-id="${item.id}">
                                <div class="item-thumbnail" style="background-image: url('${item.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2334495e"/><text x="50" y="50" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>'}"></div>
                                <div class="item-info">
                                    <div class="item-name">${item.name} <span class="rarity-tag ${item.rarity.toLowerCase()}">${item.rarity}</span></div>
                                    <div class="item-subtitle">${item.type || 'No type'}</div>
                                </div>
                                <div class="item-actions">
                                    <button class="btn-icon edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon delete-btn"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="database-detail">
                    <div id="item-detail-container">
                        <div class="empty-state">
                            <i class="fas fa-shopping-bag fa-3x"></i>
                            <h3>Select or Create an Item</h3>
                            <p>Click on an item in the list or create a new one to edit</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupItemsUI() {
        // Setup search
        const searchInput = document.getElementById('item-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.item-item');
                
                items.forEach(item => {
                    const name = item.querySelector('.item-name').textContent.toLowerCase();
                    const type = item.querySelector('.item-subtitle').textContent.toLowerCase();
                    
                    if (name.includes(searchTerm) || type.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Setup item clicks
        document.querySelectorAll('.item-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-icon')) return;
                
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'items';
                this.renderItemDetail(id);
            });
            
            // Edit button
            item.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'items';
                this.renderItemDetail(id);
            });
            
            // Delete button
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this item?')) {
                    this.data.items = this.data.items.filter(i => i.id !== item.dataset.id);
                    this.render();
                    this.saveToLocalStorage();
                }
            });
        });
        
        // New item button
        document.getElementById('new-item-btn').onclick = () => {
            this.currentEditingId = null;
            this.currentEditingType = 'items';
            this.renderItemDetail();
        };
    }
    
    renderItemDetail(id = null) {
        const item = id ? this.data.items.find(i => i.id === id) : {
            id: Date.now().toString(),
            name: '',
            type: 'Consumable',
            rarity: 'Common',
            image: '',
            description: '',
            effects: []
        };
        
        const rarityOptions = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
        const itemTypes = ['Consumable', 'Equipment', 'Material', 'Currency', 'Key Item'];
        
        document.getElementById('item-detail-container').innerHTML = `
            <div class="form-grid">
                <div class="form-section">
                    <h3>Item Basics</h3>
                    <div class="form-group">
                        <label>Item Image</label>
                        <div class="image-upload-container">
                            <div id="item-image-preview" class="image-preview" style="background-image: url('${item.image || ''}')">
                                ${!item.image ? '<div class="image-placeholder">Drag & drop or click to upload</div>' : ''}
                            </div>
                            <input type="file" id="item-image-upload" accept="image/*" style="display: none;">
                            <button class="btn btn-secondary" id="upload-item-image">
                                <i class="fas fa-upload"></i> Upload Image
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="item-name" value="${item.name}" placeholder="Item name">
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select id="item-type">
                            ${itemTypes.map(t => `<option value="${t}" ${item.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Rarity</label>
                        <select id="item-rarity">
                            ${rarityOptions.map(r => `<option value="${r}" ${item.rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Effects & Properties</h3>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="item-description" rows="4" placeholder="Item description">${item.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Effects</label>
                        <div class="effects-container">
                            ${item.effects.map(effect => `
                                <div class="effect-item">
                                    <select class="effect-type">
                                        <option value="heal" ${effect.type === 'heal' ? 'selected' : ''}>Heal</option>
                                        <option value="stat" ${effect.type === 'stat' ? 'selected' : ''}>Stat Boost</option>
                                        <option value="currency" ${effect.type === 'currency' ? 'selected' : ''}>Currency Gain</option>
                                    </select>
                                    <input type="text" class="effect-value" value="${effect.value || ''}" placeholder="Value">
                                    <button class="btn-icon remove-effect"><i class="fas fa-trash"></i></button>
                                </div>
                            `).join('')}
                            <button id="add-effect" class="btn btn-secondary"><i class="fas fa-plus"></i> Add Effect</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button id="save-item" class="btn btn-success">
                    <i class="fas fa-save"></i> ${id ? 'Save Changes' : 'Create Item'}
                </button>
                ${id ? `
                <button id="delete-item" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Delete Item
                </button>
                ` : ''}
            </div>
        `;
        
        // Setup image upload
        const imagePreview = document.getElementById('item-image-preview');
        const imageUpload = document.getElementById('item-image-upload');
        const uploadButton = document.getElementById('upload-item-image');
        
        imagePreview.addEventListener('click', () => imageUpload.click());
        uploadButton.addEventListener('click', () => imageUpload.click());
        
        imageUpload.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    imagePreview.style.backgroundImage = `url('${event.target.result}')`;
                    imagePreview.querySelector('.image-placeholder')?.remove();
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        // Setup effect buttons
        document.getElementById('add-effect').addEventListener('click', () => {
            const effectsContainer = document.querySelector('.effects-container');
            
            const newItem = document.createElement('div');
            newItem.className = 'effect-item';
            newItem.innerHTML = `
                <select class="effect-type">
                    <option value="heal">Heal</option>
                    <option value="stat">Stat Boost</option>
                    <option value="currency">Currency Gain</option>
                </select>
                <input type="text" class="effect-value" placeholder="Value">
                <button class="btn-icon remove-effect"><i class="fas fa-trash"></i></button>
            `;
            
            effectsContainer.insertBefore(newItem, document.getElementById('add-effect'));
            
            // Setup remove button
            newItem.querySelector('.remove-effect').addEventListener('click', () => {
                newItem.remove();
            });
        });
        
        // Setup remove effect buttons
        document.querySelectorAll('.remove-effect').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.target.closest('.effect-item').remove();
            });
        });
        
        // Setup save button
        document.getElementById('save-item').addEventListener('click', () => {
            const updatedItem = {
                id: item.id,
                name: document.getElementById('item-name').value,
                type: document.getElementById('item-type').value,
                rarity: document.getElementById('item-rarity').value,
                image: imagePreview.style.backgroundImage.replace('url("', '').replace('")', '').replace('url(', '').replace(')', ''),
                description: document.getElementById('item-description').value,
                effects: Array.from(document.querySelectorAll('.effect-item')).map(item => ({
                    type: item.querySelector('.effect-type').value,
                    value: item.querySelector('.effect-value').value
                }))
            };
            
            if (id) {
                // Update existing item
                const index = this.data.items.findIndex(i => i.id === id);
                this.data.items[index] = updatedItem;
            } else {
                // Add new item
                this.data.items.push(updatedItem);
            }
            
            this.saveToLocalStorage();
            this.render();
        });
        
        // Setup delete button if editing
        if (id) {
            document.getElementById('delete-item').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this item?')) {
                    this.data.items = this.data.items.filter(i => i.id !== id);
                    this.saveToLocalStorage();
                    this.render();
                }
            });
        }
    }
    
    // ==================
    // SKILL MANAGEMENT
    // ==================
    
    renderSkills() {
        return `
            <div class="database-grid">
                <div class="database-list">
                    <div class="list-header">
                        <h3>Skills</h3>
                        <div class="search-container">
                            <input type="text" id="skill-search" placeholder="Search skills...">
                        </div>
                    </div>
                    <div id="skill-list" class="scrollable-list">
                        ${this.data.skills.map(skill => `
                            <div class="database-item skill-item" data-id="${skill.id}">
                                <div class="item-thumbnail" style="background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23${this.getRarityColor(skill.rarity)}"/><text x="50" y="50" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">${skill.animation.charAt(0).toUpperCase()}</text></svg>')"></div>
                                <div class="item-info">
                                    <div class="item-name">${skill.name} <span class="rarity-tag ${skill.rarity.toLowerCase()}">${skill.rarity}</span></div>
                                    <div class="item-subtitle">${skill.element} • ${skill.damage} damage</div>
                                </div>
                                <div class="item-actions">
                                    <button class="btn-icon edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon delete-btn"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="database-detail">
                    <div id="skill-detail-container">
                        <div class="empty-state">
                            <i class="fas fa-magic fa-3x"></i>
                            <h3>Select or Create a Skill</h3>
                            <p>Click on a skill in the list or create a new one to edit</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getRarityColor(rarity) {
        const colors = {
            'Common': '95a5a6',
            'Uncommon': '2ecc71',
            'Rare': '3498db',
            'Epic': '9b59b6',
            'Legendary': 'e67e22',
            'Mythic': 'e74c3c'
        };
        return colors[rarity] || '34495e';
    }
    
    setupSkillsUI() {
        // Setup search
        const searchInput = document.getElementById('skill-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.skill-item');
                
                items.forEach(item => {
                    const name = item.querySelector('.item-name').textContent.toLowerCase();
                    const subtitle = item.querySelector('.item-subtitle').textContent.toLowerCase();
                    
                    if (name.includes(searchTerm) || subtitle.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Setup item clicks
        document.querySelectorAll('.skill-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-icon')) return;
                
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'skills';
                this.renderSkillDetail(id);
            });
            
            // Edit button
            item.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'skills';
                this.renderSkillDetail(id);
            });
            
            // Delete button
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this skill?')) {
                    this.data.skills = this.data.skills.filter(s => s.id !== item.dataset.id);
                    this.render();
                    this.saveToLocalStorage();
                }
            });
        });
        
        // New item button
        document.getElementById('new-item-btn').onclick = () => {
            this.currentEditingId = null;
            this.currentEditingType = 'skills';
            this.renderSkillDetail();
        };
    }
    
    renderSkillDetail(id = null) {
        const skill = id ? this.data.skills.find(s => s.id === id) : {
            id: Date.now().toString(),
            name: '',
            damage: 50,
            element: 'None',
            animation: 'slash',
            description: '',
            rarity: 'Common'
        };
        
        const rarityOptions = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
        const factions = this.data.factions.map(f => f.name);
        
        document.getElementById('skill-detail-container').innerHTML = `
            <div class="form-grid">
                <div class="form-section">
                    <h3>Skill Basics</h3>
                    <div class="form-group">
                        <label>Skill Name</label>
                        <input type="text" id="skill-name" value="${skill.name}" placeholder="Skill name">
                    </div>
                    <div class="form-group">
                        <label>Base Damage</label>
                        <input type="number" id="skill-damage" value="${skill.damage}" min="1">
                    </div>
                    <div class="form-group">
                        <label>Element</label>
                        <select id="skill-element">
                            <option value="None" ${skill.element === 'None' ? 'selected' : ''}>None</option>
                            ${factions.map(f => `<option value="${f}" ${skill.element === f ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Rarity</label>
                        <select id="skill-rarity">
                            ${rarityOptions.map(r => `<option value="${r}" ${skill.rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Animation</h3>
                    <div class="animation-selector">
                        <div class="animation-option ${skill.animation === 'slash' ? 'active' : ''}" data-animation="slash">
                            <i class="fas fa-slash"></i>
                            <span>Slash</span>
                        </div>
                        <div class="animation-option ${skill.animation === 'fire' ? 'active' : ''}" data-animation="fire">
                            <i class="fas fa-fire"></i>
                            <span>Fire</span>
                        </div>
                        <div class="animation-option ${skill.animation === 'ice' ? 'active' : ''}" data-animation="ice">
                            <i class="fas fa-snowflake"></i>
                            <span>Ice</span>
                        </div>
                        <div class="animation-option ${skill.animation === 'lightning' ? 'active' : ''}" data-animation="lightning">
                            <i class="fas fa-bolt"></i>
                            <span>Lightning</span>
                        </div>
                        <div class="animation-option ${skill.animation === 'heal' ? 'active' : ''}" data-animation="heal">
                            <i class="fas fa-heart"></i>
                            <span>Heal</span>
                        </div>
                    </div>
                    <div class="animation-preview">
                        <div class="animation-preview-content ${skill.animation}"></div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Description</h3>
                    <div class="form-group">
                        <textarea id="skill-description" rows="6" placeholder="Skill description">${skill.description || ''}</textarea>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button id="save-skill" class="btn btn-success">
                    <i class="fas fa-save"></i> ${id ? 'Save Changes' : 'Create Skill'}
                </button>
                ${id ? `
                <button id="delete-skill" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Delete Skill
                </button>
                ` : ''}
            </div>
        `;
        
        // Setup animation selection
        document.querySelectorAll('.animation-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.animation-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });
        
        // Setup save button
        document.getElementById('save-skill').addEventListener('click', () => {
            const selectedAnimation = document.querySelector('.animation-option.active').dataset.animation;
            
            const updatedSkill = {
                id: skill.id,
                name: document.getElementById('skill-name').value,
                damage: parseInt(document.getElementById('skill-damage').value) || 50,
                element: document.getElementById('skill-element').value,
                animation: selectedAnimation,
                description: document.getElementById('skill-description').value,
                rarity: document.getElementById('skill-rarity').value
            };
            
            if (id) {
                // Update existing skill
                const index = this.data.skills.findIndex(s => s.id === id);
                this.data.skills[index] = updatedSkill;
            } else {
                // Add new skill
                this.data.skills.push(updatedSkill);
            }
            
            this.saveToLocalStorage();
            this.render();
        });
        
        // Setup delete button if editing
        if (id) {
            document.getElementById('delete-skill').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this skill?')) {
                    this.data.skills = this.data.skills.filter(s => s.id !== id);
                    this.saveToLocalStorage();
                    this.render();
                }
            });
        }
    }
    
    // =====================
    // FACTION MANAGEMENT
    // =====================
    
    renderFactions() {
        return `
            <div class="database-grid">
                <div class="database-list">
                    <div class="list-header">
                        <h3>Factions & Elements</h3>
                        <div class="search-container">
                            <input type="text" id="faction-search" placeholder="Search factions...">
                        </div>
                    </div>
                    <div id="faction-list" class="scrollable-list">
                        ${this.data.factions.map(faction => `
                            <div class="database-item faction-item" data-id="${faction.id}">
                                <div class="item-thumbnail" style="background-color: ${faction.color || '#34495e'};"></div>
                                <div class="item-info">
                                    <div class="item-name">${faction.name}</div>
                                    <div class="item-subtitle">${faction.type} • ${faction.weaknesses.length} weaknesses</div>
                                </div>
                                <div class="item-actions">
                                    <button class="btn-icon edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon delete-btn"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="database-detail">
                    <div id="faction-detail-container">
                        <div class="empty-state">
                            <i class="fas fa-shield-alt fa-3x"></i>
                            <h3>Select or Create a Faction</h3>
                            <p>Click on a faction in the list or create a new one to edit</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupFactionsUI() {
        // Setup search
        const searchInput = document.getElementById('faction-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.faction-item');
                
                items.forEach(item => {
                    const name = item.querySelector('.item-name').textContent.toLowerCase();
                    const subtitle = item.querySelector('.item-subtitle').textContent.toLowerCase();
                    
                    if (name.includes(searchTerm) || subtitle.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Setup item clicks
        document.querySelectorAll('.faction-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-icon')) return;
                
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'factions';
                this.renderFactionDetail(id);
            });
            
            // Edit button
            item.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'factions';
                this.renderFactionDetail(id);
            });
            
            // Delete button
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this faction?')) {
                    this.data.factions = this.data.factions.filter(f => f.id !== item.dataset.id);
                    this.render();
                    this.saveToLocalStorage();
                }
            });
        });
        
        // New item button
        document.getElementById('new-item-btn').onclick = () => {
            this.currentEditingId = null;
            this.currentEditingType = 'factions';
            this.renderFactionDetail();
        };
    }
    
    renderFactionDetail(id = null) {
        const faction = id ? this.data.factions.find(f => f.id === id) : {
            id: Date.now().toString(),
            name: '',
            type: 'Faction',
            color: '#34495e',
            weaknesses: [],
            resistances: []
        };
        
        const factionTypes = ['Faction', 'Element'];
        
        document.getElementById('faction-detail-container').innerHTML = `
            <div class="form-grid">
                <div class="form-section">
                    <h3>Faction Basics</h3>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="faction-name" value="${faction.name}" placeholder="Faction name">
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select id="faction-type">
                            ${factionTypes.map(t => `<option value="${t}" ${faction.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Color</label>
                        <input type="color" id="faction-color" value="${faction.color || '#34495e'}">
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Weaknesses & Resistances</h3>
                    <div class="form-group">
                        <label>Weak Against</label>
                        <div class="weaknesses-container">
                            ${this.data.factions.filter(f => f.id !== id).map(f => `
                                <div class="weakness-item">
                                    <input type="checkbox" id="weak-${f.id}" ${faction.weaknesses.includes(f.id) ? 'checked' : ''}>
                                    <label for="weak-${f.id}" style="background-color: ${f.color}">${f.name}</label>
                                </div>
                            `).join('')}
                            ${this.data.factions.filter(f => f.id !== id).length === 0 ? 
                                '<div class="empty-state" style="padding: 10px;">Create factions first to set weaknesses</div>' : ''}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Resists</label>
                        <div class="resistances-container">
                            ${this.data.factions.filter(f => f.id !== id).map(f => `
                                <div class="resistance-item">
                                    <input type="checkbox" id="resist-${f.id}" ${faction.resistances.includes(f.id) ? 'checked' : ''}>
                                    <label for="resist-${f.id}" style="background-color: ${f.color}">${f.name}</label>
                                </div>
                            `).join('')}
                            ${this.data.factions.filter(f => f.id !== id).length === 0 ? 
                                '<div class="empty-state" style="padding: 10px;">Create factions first to set resistances</div>' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button id="save-faction" class="btn btn-success">
                    <i class="fas fa-save"></i> ${id ? 'Save Changes' : 'Create Faction'}
                </button>
                ${id ? `
                <button id="delete-faction" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Delete Faction
                </button>
                ` : ''}
            </div>
        `;
        
        // Setup save button
        document.getElementById('save-faction').addEventListener('click', () => {
            const weaknesses = [];
            const resistances = [];
            
            document.querySelectorAll('.weakness-item input:checked').forEach(checkbox => {
                weaknesses.push(checkbox.id.replace('weak-', ''));
            });
            
            document.querySelectorAll('.resistance-item input:checked').forEach(checkbox => {
                resistances.push(checkbox.id.replace('resist-', ''));
            });
            
            const updatedFaction = {
                id: faction.id,
                name: document.getElementById('faction-name').value,
                type: document.getElementById('faction-type').value,
                color: document.getElementById('faction-color').value,
                weaknesses: weaknesses,
                resistances: resistances
            };
            
            if (id) {
                // Update existing faction
                const index = this.data.factions.findIndex(f => f.id === id);
                this.data.factions[index] = updatedFaction;
            } else {
                // Add new faction
                this.data.factions.push(updatedFaction);
            }
            
            this.saveToLocalStorage();
            this.render();
        });
        
        // Setup delete button if editing
        if (id) {
            document.getElementById('delete-faction').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this faction?')) {
                    this.data.factions = this.data.factions.filter(f => f.id !== id);
                    this.saveToLocalStorage();
                    this.render();
                }
            });
        }
    }
    
    // =====================
    // GATCHA MANAGEMENT
    // =====================
    
    renderGatcha() {
        return `
            <div class="database-grid">
                <div class="database-list">
                    <div class="list-header">
                        <h3>Gatcha Banners</h3>
                        <div class="search-container">
                            <input type="text" id="gatcha-search" placeholder="Search banners...">
                        </div>
                    </div>
                    <div id="gatcha-list" class="scrollable-list">
                        ${this.data.gatchaBanners.map(banner => `
                            <div class="database-item gatcha-item" data-id="${banner.id}">
                                <div class="item-thumbnail" style="background-image: url('${banner.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%234a6fa5"/><text x="50" y="50" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">Banner</text></svg>'}')"></div>
                                <div class="item-info">
                                    <div class="item-name">${banner.name}</div>
                                    <div class="item-subtitle">${banner.characters.length} chars • ${banner.items.length} items</div>
                                </div>
                                <div class="item-actions">
                                    <button class="btn-icon edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon delete-btn"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="database-detail">
                    <div id="gatcha-detail-container">
                        <div class="empty-state">
                            <i class="fas fa-gem fa-3x"></i>
                            <h3>Select or Create a Banner</h3>
                            <p>Click on a banner in the list or create a new one to edit</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupGatchaUI() {
        // Setup search
        const searchInput = document.getElementById('gatcha-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.gatcha-item');
                
                items.forEach(item => {
                    const name = item.querySelector('.item-name').textContent.toLowerCase();
                    const subtitle = item.querySelector('.item-subtitle').textContent.toLowerCase();
                    
                    if (name.includes(searchTerm) || subtitle.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Setup item clicks
        document.querySelectorAll('.gatcha-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-icon')) return;
                
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'gatcha';
                this.renderGatchaDetail(id);
            });
            
            // Edit button
            item.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'gatcha';
                this.renderGatchaDetail(id);
            });
            
            // Delete button
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this banner?')) {
                    this.data.gatchaBanners = this.data.gatchaBanners.filter(g => g.id !== item.dataset.id);
                    this.render();
                    this.saveToLocalStorage();
                }
            });
        });
        
        // New item button
        document.getElementById('new-item-btn').onclick = () => {
            this.currentEditingId = null;
            this.currentEditingType = 'gatcha';
            this.renderGatchaDetail();
        };
    }
    
    renderGatchaDetail(id = null) {
        const banner = id ? this.data.gatchaBanners.find(g => g.id === id) : {
            id: Date.now().toString(),
            name: 'New Banner',
            image: '',
            characters: [],
            items: [],
            rarities: [
                { name: 'Common', rate: 70, characters: [], items: [] },
                { name: 'Uncommon', rate: 20, characters: [], items: [] },
                { name: 'Rare', rate: 8, characters: [], items: [] },
                { name: 'Epic', rate: 1.9, characters: [], items: [] },
                { name: 'Legendary', rate: 0.1, characters: [], items: [] }
            ],
            singleSummonCost: {
                currency: 'gems',
                amount: 100
            },
            multiSummonCost: {
                currency: 'gems',
                amount: 900
            },
            multiSummonCount: 10
        };
        
        const rarityOptions = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
        const currencies = this.data.system.currencies.map(c => c.name);
        
        document.getElementById('gatcha-detail-container').innerHTML = `
            <div class="form-grid">
                <div class="form-section">
                    <h3>Banner Basics</h3>
                    <div class="form-group">
                        <label>Banner Image</label>
                        <div class="image-upload-container">
                            <div id="gatcha-image-preview" class="image-preview" style="background-image: url('${banner.image || ''}')">
                                ${!banner.image ? '<div class="image-placeholder">Drag & drop or click to upload</div>' : ''}
                            </div>
                            <input type="file" id="gatcha-image-upload" accept="image/*" style="display: none;">
                            <button class="btn btn-secondary" id="upload-gatcha-image">
                                <i class="fas fa-upload"></i> Upload Image
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Banner Name</label>
                        <input type="text" id="gatcha-name" value="${banner.name}" placeholder="Banner name">
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Rarity Rates</h3>
                    <div class="rarity-rates">
                        ${banner.rarities.map(rarity => `
                            <div class="rarity-rate-item">
                                <div class="rarity-name ${rarity.name.toLowerCase()}">${rarity.name}</div>
                                <input type="number" class="rarity-rate" value="${rarity.rate}" min="0" max="100" step="0.1">%
                                <button class="btn-icon toggle-rarity-content"><i class="fas fa-chevron-down"></i></button>
                            </div>
                            <div class="rarity-content" style="display: none;">
                                <h4>Characters</h4>
                                <div class="rarity-characters">
                                    ${this.data.characters.map(char => `
                                        <div class="rarity-item ${char.rarity.toLowerCase()} ${rarity.characters.includes(char.id) ? 'selected' : ''}" 
                                             data-id="${char.id}" data-type="character">
                                            <div class="item-thumbnail" style="background-image: url('${char.image || ''}')"></div>
                                            <div class="item-info">
                                                <div class="item-name">${char.name}</div>
                                                <div class="item-subtitle">${char.rarity}</div>
                                            </div>
                                        </div>
                                    `).filter(char => char.includes(char.rarity.toLowerCase() === rarity.name.toLowerCase())).join('')}
                                </div>
                                
                                <h4 style="margin-top: 15px;">Items</h4>
                                <div class="rarity-items">
                                    ${this.data.items.map(item => `
                                        <div class="rarity-item ${item.rarity.toLowerCase()} ${rarity.items.includes(item.id) ? 'selected' : ''}" 
                                             data-id="${item.id}" data-type="item">
                                            <div class="item-thumbnail" style="background-image: url('${item.image || ''}')"></div>
                                            <div class="item-info">
                                                <div class="item-name">${item.name}</div>
                                                <div class="item-subtitle">${item.rarity}</div>
                                            </div>
                                        </div>
                                    `).filter(item => item.includes(item.rarity.toLowerCase() === rarity.name.toLowerCase())).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Summon Costs</h3>
                    <div class="form-group">
                        <label>Single Summon</label>
                        <div class="cost-inputs">
                            <select id="single-currency">
                                ${currencies.map(c => `<option value="${c}" ${banner.singleSummonCost.currency === c ? 'selected' : ''}>${c}</option>`).join('')}
                            </select>
                            <input type="number" id="single-amount" value="${banner.singleSummonCost.amount}" min="1">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Multi Summon (${banner.multiSummonCount} pulls)</label>
                        <div class="cost-inputs">
                            <select id="multi-currency">
                                ${currencies.map(c => `<option value="${c}" ${banner.multiSummonCost.currency === c ? 'selected' : ''}>${c}</option>`).join('')}
                            </select>
                            <input type="number" id="multi-amount" value="${banner.multiSummonCost.amount}" min="1">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Multi Summon Count</label>
                        <input type="number" id="multi-count" value="${banner.multiSummonCount}" min="2" max="100">
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button id="save-gatcha" class="btn btn-success">
                    <i class="fas fa-save"></i> ${id ? 'Save Changes' : 'Create Banner'}
                </button>
                ${id ? `
                <button id="delete-gatcha" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Delete Banner
                </button>
                ` : ''}
            </div>
        `;
        
        // Setup image upload
        const imagePreview = document.getElementById('gatcha-image-preview');
        const imageUpload = document.getElementById('gatcha-image-upload');
        const uploadButton = document.getElementById('upload-gatcha-image');
        
        imagePreview.addEventListener('click', () => imageUpload.click());
        uploadButton.addEventListener('click', () => imageUpload.click());
        
        imageUpload.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    imagePreview.style.backgroundImage = `url('${event.target.result}')`;
                    imagePreview.querySelector('.image-placeholder')?.remove();
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        // Setup rarity content toggles
        document.querySelectorAll('.toggle-rarity-content').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const content = btn.closest('.rarity-rate-item').nextElementSibling;
                const isHidden = content.style.display === 'none';
                
                content.style.display = isHidden ? 'block' : 'none';
                btn.innerHTML = isHidden ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
            });
        });
        
        // Setup rarity item selection
        document.querySelectorAll('.rarity-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
            });
        });
        
        // Setup save button
        document.getElementById('save-gatcha').addEventListener('click', () => {
            // Collect rarity data
            const rarities = [];
            document.querySelectorAll('.rarity-rate-item').forEach((item, index) => {
                const rate = parseFloat(item.querySelector('.rarity-rate').value);
                const content = item.nextElementSibling;
                
                const characters = [];
                const items = [];
                
                content.querySelectorAll('.rarity-characters .rarity-item.selected').forEach(char => {
                    characters.push(char.dataset.id);
                });
                
                content.querySelectorAll('.rarity-items .rarity-item.selected').forEach(item => {
                    items.push(item.dataset.id);
                });
                
                rarities.push({
                    name: item.querySelector('.rarity-name').textContent,
                    rate: rate,
                    characters: characters,
                    items: items
                });
            });
            
            const updatedBanner = {
                id: banner.id,
                name: document.getElementById('gatcha-name').value,
                image: imagePreview.style.backgroundImage.replace('url("', '').replace('")', '').replace('url(', '').replace(')', ''),
                rarities: rarities,
                singleSummonCost: {
                    currency: document.getElementById('single-currency').value,
                    amount: parseInt(document.getElementById('single-amount').value) || 100
                },
                multiSummonCost: {
                    currency: document.getElementById('multi-currency').value,
                    amount: parseInt(document.getElementById('multi-amount').value) || 900
                },
                multiSummonCount: parseInt(document.getElementById('multi-count').value) || 10
            };
            
            if (id) {
                // Update existing banner
                const index = this.data.gatchaBanners.findIndex(g => g.id === id);
                this.data.gatchaBanners[index] = updatedBanner;
            } else {
                // Add new banner
                this.data.gatchaBanners.push(updatedBanner);
            }
            
            this.saveToLocalStorage();
            this.render();
        });
        
        // Setup delete button if editing
        if (id) {
            document.getElementById('delete-gatcha').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this banner?')) {
                    this.data.gatchaBanners = this.data.gatchaBanners.filter(g => g.id !== id);
                    this.saveToLocalStorage();
                    this.render();
                }
            });
        }
    }
    
    // ========================
    // ACHIEVEMENT MANAGEMENT
    // ========================
    
    renderAchievements() {
        return `
            <div class="database-grid">
                <div class="database-list">
                    <div class="list-header">
                        <h3>Achievements</h3>
                        <div class="search-container">
                            <input type="text" id="achievement-search" placeholder="Search achievements...">
                        </div>
                    </div>
                    <div id="achievement-list" class="scrollable-list">
                        ${this.data.achievements.map(achievement => `
                            <div class="database-item achievement-item" data-id="${achievement.id}">
                                <div class="item-thumbnail" style="background-color: #${achievement.rarity === 'Rare' ? '3498db' : achievement.rarity === 'Epic' ? '9b59b6' : 'e67e22'};"></div>
                                <div class="item-info">
                                    <div class="item-name">${achievement.name} <span class="rarity-tag ${achievement.rarity.toLowerCase()}">${achievement.rarity}</span></div>
                                    <div class="item-subtitle">${achievement.type} • ${achievement.goal} required</div>
                                </div>
                                <div class="item-actions">
                                    <button class="btn-icon edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon delete-btn"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="database-detail">
                    <div id="achievement-detail-container">
                        <div class="empty-state">
                            <i class="fas fa-trophy fa-3x"></i>
                            <h3>Select or Create an Achievement</h3>
                            <p>Click on an achievement in the list or create a new one to edit</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupAchievementsUI() {
        // Setup search
        const searchInput = document.getElementById('achievement-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.achievement-item');
                
                items.forEach(item => {
                    const name = item.querySelector('.item-name').textContent.toLowerCase();
                    const subtitle = item.querySelector('.item-subtitle').textContent.toLowerCase();
                    
                    if (name.includes(searchTerm) || subtitle.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Setup item clicks
        document.querySelectorAll('.achievement-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-icon')) return;
                
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'achievements';
                this.renderAchievementDetail(id);
            });
            
            // Edit button
            item.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'achievements';
                this.renderAchievementDetail(id);
            });
            
            // Delete button
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this achievement?')) {
                    this.data.achievements = this.data.achievements.filter(a => a.id !== item.dataset.id);
                    this.render();
                    this.saveToLocalStorage();
                }
            });
        });
        
        // New item button
        document.getElementById('new-item-btn').onclick = () => {
            this.currentEditingId = null;
            this.currentEditingType = 'achievements';
            this.renderAchievementDetail();
        };
        
        // Add auto-generate button
        const autoGenerateBtn = document.createElement('button');
        autoGenerateBtn.id = 'auto-generate-achievements';
        autoGenerateBtn.className = 'btn btn-primary';
        autoGenerateBtn.innerHTML = '<i class="fas fa-bolt"></i> Auto-Generate Achievements';
        
        document.querySelector('.database-actions').appendChild(autoGenerateBtn);
        
        autoGenerateBtn.addEventListener('click', () => this.openAutoGenerateModal());
    }
    
    openAutoGenerateModal() {
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        
        modalBackdrop.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Auto-Generate Achievements</h3>
                    <button class="btn-icon close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Number of Achievements</label>
                        <input type="number" id="achievement-count" value="10" min="1" max="50">
                    </div>
                    <div class="form-group">
                        <label>Rarity Distribution</label>
                        <div class="rarity-distribution">
                            <div class="distribution-item">
                                <label>Common</label>
                                <input type="number" id="common-rarity" value="40" min="0" max="100">%
                            </div>
                            <div class="distribution-item">
                                <label>Uncommon</label>
                                <input type="number" id="uncommon-rarity" value="30" min="0" max="100">%
                            </div>
                            <div class="distribution-item">
                                <label>Rare</label>
                                <input type="number" id="rare-rarity" value="20" min="0" max="100">%
                            </div>
                            <div class="distribution-item">
                                <label>Epic</label>
                                <input type="number" id="epic-rarity" value="10" min="0" max="100">%
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Types to Include</label>
                        <div class="types-container">
                            <div class="type-item">
                                <input type="checkbox" id="type-characters" checked>
                                <label for="type-characters">Character Collection</label>
                            </div>
                            <div class="type-item">
                                <input type="checkbox" id="type-gatcha" checked>
                                <label for="type-gatcha">Gatcha Pulls</label>
                            </div>
                            <div class="type-item">
                                <input type="checkbox" id="type-levels" checked>
                                <label for="type-levels">Level Progression</label>
                            </div>
                            <div class="type-item">
                                <input type="checkbox" id="type-story" checked>
                                <label for="type-story">Story Completion</label>
                            </div>
                            <div class="type-item">
                                <input type="checkbox" id="type-battles" checked>
                                <label for="type-battles">Battle Achievements</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancel</button>
                    <button id="generate-achievements" class="btn btn-success">Generate</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalBackdrop);
        
        // Setup close buttons
        const closeButtons = modalBackdrop.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modalBackdrop);
            });
        });
        
        // Setup generate button
        modalBackdrop.querySelector('#generate-achievements').addEventListener('click', () => {
            const count = parseInt(document.getElementById('achievement-count').value) || 10;
            const commonPercent = parseInt(document.getElementById('common-rarity').value) || 40;
            const uncommonPercent = parseInt(document.getElementById('uncommon-rarity').value) || 30;
            const rarePercent = parseInt(document.getElementById('rare-rarity').value) || 20;
            const epicPercent = parseInt(document.getElementById('epic-rarity').value) || 10;
            
            // Check if percentages add up to 100
            if (commonPercent + uncommonPercent + rarePercent + epicPercent !== 100) {
                alert('Rarity percentages must add up to 100!');
                return;
            }
            
            // Generate achievements
            this.generateAchievements(count, {
                common: commonPercent,
                uncommon: uncommonPercent,
                rare: rarePercent,
                epic: epicPercent
            });
            
            document.body.removeChild(modalBackdrop);
            this.render();
        });
    }
    
    generateAchievements(count, distribution) {
        const achievementTypes = [];
        
        if (document.getElementById('type-characters').checked) achievementTypes.push('characters');
        if (document.getElementById('type-gatcha').checked) achievementTypes.push('gatcha');
        if (document.getElementById('type-levels').checked) achievementTypes.push('levels');
        if (document.getElementById('type-story').checked) achievementTypes.push('story');
        if (document.getElementById('type-battles').checked) achievementTypes.push('battles');
        
        if (achievementTypes.length === 0) {
            alert('Please select at least one achievement type!');
            return;
        }
        
        // Clear existing achievements if we're generating new ones
        this.data.achievements = [];
        
        const rarityMap = {
            common: distribution.common,
            uncommon: distribution.uncommon,
            rare: distribution.rare,
            epic: distribution.epic
        };
        
        // Create a pool of possible achievements
        const possibleAchievements = [];
        
        // Character collection achievements
        if (achievementTypes.includes('characters')) {
            const totalCharacters = this.data.characters.length;
            if (totalCharacters > 0) {
                possibleAchievements.push({
                    type: 'characters',
                    name: 'Character Collector',
                    description: 'Collect 10 characters',
                    goal: 10,
                    rarity: 'common',
                    reward: { type: 'currency', amount: 100, currency: 'gems' }
                });
                
                if (totalCharacters >= 25) {
                    possibleAchievements.push({
                        type: 'characters',
                        name: 'Dedicated Collector',
                        description: 'Collect 25 characters',
                        goal: 25,
                        rarity: 'uncommon',
                        reward: { type: 'currency', amount: 250, currency: 'gems' }
                    });
                }
                
                if (totalCharacters >= 50) {
                    possibleAchievements.push({
                        type: 'characters',
                        name: 'Master Collector',
                        description: 'Collect 50 characters',
                        goal: 50,
                        rarity: 'rare',
                        reward: { type: 'currency', amount: 500, currency: 'gems' }
                    });
                }
                
                if (totalCharacters >= 100) {
                    possibleAchievements.push({
                        type: 'characters',
                        name: 'Legendary Collector',
                        description: 'Collect all characters',
                        goal: totalCharacters,
                        rarity: 'epic',
                        reward: { type: 'gatcha', pulls: 10 }
                    });
                }
            }
        }
        
        // Gatcha achievements
        if (achievementTypes.includes('gatcha')) {
            possibleAchievements.push({
                type: 'gatcha',
                name: 'First Pull',
                description: 'Perform your first gatcha pull',
                goal: 1,
                rarity: 'common',
                reward: { type: 'currency', amount: 50, currency: 'gems' }
            });
            
            possibleAchievements.push({
                type: 'gatcha',
                name: 'Gatcha Enthusiast',
                description: 'Perform 100 gatcha pulls',
                goal: 100,
                rarity: 'uncommon',
                reward: { type: 'currency', amount: 200, currency: 'gems' }
            });
            
            possibleAchievements.push({
                type: 'gatcha',
                name: 'Gatcha Master',
                description: 'Perform 1000 gatcha pulls',
                goal: 1000,
                rarity: 'rare',
                reward: { type: 'gatcha', pulls: 5 }
            });
        }
        
        // Level progression achievements
        if (achievementTypes.includes('levels')) {
            possibleAchievements.push({
                type: 'levels',
                name: 'Level 10',
                description: 'Reach level 10',
                goal: 10,
                rarity: 'common',
                reward: { type: 'currency', amount: 100, currency: 'coins' }
            });
            
            possibleAchievements.push({
                type: 'levels',
                name: 'Level 50',
                description: 'Reach level 50',
                goal: 50,
                rarity: 'uncommon',
                reward: { type: 'currency', amount: 500, currency: 'coins' }
            });
            
            possibleAchievements.push({
                type: 'levels',
                name: 'Level 100',
                description: 'Reach level 100',
                goal: 100,
                rarity: 'rare',
                reward: { type: 'currency', amount: 1000, currency: 'coins' }
            });
        }
        
        // Story completion achievements
        if (achievementTypes.includes('story')) {
            const totalStages = this.data.storyArcs.reduce((sum, arc) => sum + arc.stages.length, 0);
            if (totalStages > 0) {
                possibleAchievements.push({
                    type: 'story',
                    name: 'Story Starter',
                    description: 'Complete 5 story stages',
                    goal: 5,
                    rarity: 'common',
                    reward: { type: 'currency', amount: 100, currency: 'coins' }
                });
                
                if (totalStages >= 20) {
                    possibleAchievements.push({
                        type: 'story',
                        name: 'Story Adventurer',
                        description: 'Complete 20 story stages',
                        goal: 20,
                        rarity: 'uncommon',
                        reward: { type: 'currency', amount: 250, currency: 'coins' }
                    });
                }
                
                if (totalStages >= 50) {
                    possibleAchievements.push({
                        type: 'story',
                        name: 'Story Master',
                        description: 'Complete 50 story stages',
                        goal: 50,
                        rarity: 'rare',
                        reward: { type: 'gatcha', pulls: 3 }
                    });
                }
            }
        }
        
        // Battle achievements
        if (achievementTypes.includes('battles')) {
            possibleAchievements.push({
                type: 'battles',
                name: 'First Victory',
                description: 'Win your first battle',
                goal: 1,
                rarity: 'common',
                reward: { type: 'currency', amount: 50, currency: 'coins' }
            });
            
            possibleAchievements.push({
                type: 'battles',
                name: 'Battle Veteran',
                description: 'Win 100 battles',
                goal: 100,
                rarity: 'uncommon',
                reward: { type: 'currency', amount: 250, currency: 'coins' }
            });
            
            possibleAchievements.push({
                type: 'battles',
                name: 'Battle Champion',
                description: 'Win 500 battles',
                goal: 500,
                rarity: 'rare',
                reward: { type: 'gatcha', pulls: 5 }
            });
        }
        
        // Shuffle possible achievements
        for (let i = possibleAchievements.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [possibleAchievements[i], possibleAchievements[j]] = [possibleAchievements[j], possibleAchievements[i]];
        }
        
        // Select the required number
        const selectedAchievements = possibleAchievements.slice(0, count);
        
        // Add IDs and push to data
        selectedAchievements.forEach(achievement => {
            achievement.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
            this.data.achievements.push(achievement);
        });
        
        this.saveToLocalStorage();
    }
    
    renderAchievementDetail(id = null) {
        const achievement = id ? this.data.achievements.find(a => a.id === id) : {
            id: Date.now().toString(),
            name: '',
            description: '',
            type: 'characters',
            goal: 10,
            rarity: 'Common',
            reward: {
                type: 'currency',
                amount: 100,
                currency: this.data.system.currencies.length > 0 ? this.data.system.currencies[0].name : 'gems'
            }
        };
        
        const rarityOptions = ['Common', 'Uncommon', 'Rare', 'Epic'];
        const achievementTypes = ['characters', 'gatcha', 'levels', 'story', 'battles'];
        const currencies = this.data.system.currencies.map(c => c.name);
        
        document.getElementById('achievement-detail-container').innerHTML = `
            <div class="form-grid">
                <div class="form-section">
                    <h3>Achievement Basics</h3>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="achievement-name" value="${achievement.name}" placeholder="Achievement name">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="achievement-description" rows="3" placeholder="Achievement description">${achievement.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select id="achievement-type">
                            ${achievementTypes.map(t => `<option value="${t}" ${achievement.type === t ? 'selected' : ''}>${this.formatAchievementType(t)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Goal</label>
                        <input type="number" id="achievement-goal" value="${achievement.goal}" min="1">
                    </div>
                    <div class="form-group">
                        <label>Rarity</label>
                        <select id="achievement-rarity">
                            ${rarityOptions.map(r => `<option value="${r}" ${achievement.rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Reward</h3>
                    <div class="form-group">
                        <label>Reward Type</label>
                        <select id="reward-type">
                            <option value="currency" ${achievement.reward.type === 'currency' ? 'selected' : ''}>Currency</option>
                            <option value="item" ${achievement.reward.type === 'item' ? 'selected' : ''}>Item</option>
                            <option value="gatcha" ${achievement.reward.type === 'gatcha' ? 'selected' : ''}>Gatcha Pulls</option>
                            <option value="character" ${achievement.reward.type === 'character' ? 'selected' : ''}>Character</option>
                        </select>
                    </div>
                    
                    <div id="reward-details">
                        ${this.renderRewardDetails(achievement.reward)}
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button id="save-achievement" class="btn btn-success">
                    <i class="fas fa-save"></i> ${id ? 'Save Changes' : 'Create Achievement'}
                </button>
                ${id ? `
                <button id="delete-achievement" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Delete Achievement
                </button>
                ` : ''}
            </div>
        `;
        
        // Setup reward type change
        document.getElementById('reward-type').addEventListener('change', () => {
            const rewardType = document.getElementById('reward-type').value;
            const rewardDetails = document.getElementById('reward-details');
            rewardDetails.innerHTML = this.renderRewardDetails({ type: rewardType });
        });
        
        // Setup save button
        document.getElementById('save-achievement').addEventListener('click', () => {
            const rewardType = document.getElementById('reward-type').value;
            let reward = null;
            
            switch(rewardType) {
                case 'currency':
                    reward = {
                        type: 'currency',
                        amount: parseInt(document.getElementById('reward-amount').value) || 100,
                        currency: document.getElementById('reward-currency').value
                    };
                    break;
                case 'item':
                    reward = {
                        type: 'item',
                        itemId: document.getElementById('reward-item').value,
                        amount: parseInt(document.getElementById('reward-item-amount').value) || 1
                    };
                    break;
                case 'gatcha':
                    reward = {
                        type: 'gatcha',
                        pulls: parseInt(document.getElementById('reward-pulls').value) || 1
                    };
                    break;
                case 'character':
                    reward = {
                        type: 'character',
                        characterId: document.getElementById('reward-character').value
                    };
                    break;
            }
            
            const updatedAchievement = {
                id: achievement.id,
                name: document.getElementById('achievement-name').value,
                description: document.getElementById('achievement-description').value,
                type: document.getElementById('achievement-type').value,
                goal: parseInt(document.getElementById('achievement-goal').value) || 10,
                rarity: document.getElementById('achievement-rarity').value,
                reward: reward
            };
            
            if (id) {
                // Update existing achievement
                const index = this.data.achievements.findIndex(a => a.id === id);
                this.data.achievements[index] = updatedAchievement;
            } else {
                // Add new achievement
                this.data.achievements.push(updatedAchievement);
            }
            
            this.saveToLocalStorage();
            this.render();
        });
        
        // Setup delete button if editing
        if (id) {
            document.getElementById('delete-achievement').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this achievement?')) {
                    this.data.achievements = this.data.achievements.filter(a => a.id !== id);
                    this.saveToLocalStorage();
                    this.render();
                }
            });
        }
    }
    
    renderRewardDetails(reward) {
        const currencies = this.data.system.currencies.map(c => c.name);
        const items = this.data.items;
        const characters = this.data.characters;
        
        switch(reward.type) {
            case 'currency':
                return `
                    <div class="form-group">
                        <label>Currency</label>
                        <select id="reward-currency">
                            ${currencies.map(c => `<option value="${c}" ${reward.currency === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" id="reward-amount" value="${reward.amount || 100}" min="1">
                    </div>
                `;
                
            case 'item':
                return `
                    <div class="form-group">
                        <label>Item</label>
                        <select id="reward-item">
                            ${items.map(i => `<option value="${i.id}" ${reward.itemId === i.id ? 'selected' : ''}>${i.name} (${i.rarity})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" id="reward-item-amount" value="${reward.amount || 1}" min="1">
                    </div>
                `;
                
            case 'gatcha':
                return `
                    <div class="form-group">
                        <label>Gatcha Pulls</label>
                        <input type="number" id="reward-pulls" value="${reward.pulls || 1}" min="1">
                    </div>
                `;
                
            case 'character':
                return `
                    <div class="form-group">
                        <label>Character</label>
                        <select id="reward-character">
                            ${characters.map(c => `<option value="${c.id}" ${reward.characterId === c.id ? 'selected' : ''}>${c.name} (${c.rarity})</option>`).join('')}
                        </select>
                    </div>
                `;
                
            default:
                return '';
        }
    }
    
    formatAchievementType(type) {
        const names = {
            'characters': 'Character Collection',
            'gatcha': 'Gatcha Pulls',
            'levels': 'Level Progression',
            'story': 'Story Completion',
            'battles': 'Battles'
        };
        return names[type] || type;
    }
    
    // =================
    // STORY MANAGEMENT
    // =================
    
    renderStory() {
        return `
            <div class="database-grid">
                <div class="database-list">
                    <div class="list-header">
                        <h3>Story Arcs</h3>
                        <div class="search-container">
                            <input type="text" id="story-search" placeholder="Search arcs...">
                        </div>
                    </div>
                    <div id="story-list" class="scrollable-list">
                        ${this.data.storyArcs.map(arc => `
                            <div class="database-item story-item" data-id="${arc.id}">
                                <div class="item-thumbnail" style="background-color: #4a6fa5;"></div>
                                <div class="item-info">
                                    <div class="item-name">${arc.name}</div>
                                    <div class="item-subtitle">${arc.stages.length} stages</div>
                                </div>
                                <div class="item-actions">
                                    <button class="btn-icon edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon delete-btn"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="database-detail">
                    <div id="story-detail-container">
                        <div class="empty-state">
                            <i class="fas fa-book fa-3x"></i>
                            <h3>Select or Create a Story Arc</h3>
                            <p>Click on an arc in the list or create a new one to edit</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupStoryUI() {
        // Setup search
        const searchInput = document.getElementById('story-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.story-item');
                
                items.forEach(item => {
                    const name = item.querySelector('.item-name').textContent.toLowerCase();
                    const subtitle = item.querySelector('.item-subtitle').textContent.toLowerCase();
                    
                    if (name.includes(searchTerm) || subtitle.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Setup item clicks
        document.querySelectorAll('.story-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-icon')) return;
                
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'story';
                this.renderStoryDetail(id);
            });
            
            // Edit button
            item.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.dataset.id;
                this.currentEditingId = id;
                this.currentEditingType = 'story';
                this.renderStoryDetail(id);
            });
            
            // Delete button
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this story arc?')) {
                    this.data.storyArcs = this.data.storyArcs.filter(a => a.id !== item.dataset.id);
                    this.render();
                    this.saveToLocalStorage();
                }
            });
        });
        
        // New item button
        document.getElementById('new-item-btn').onclick = () => {
            this.currentEditingId = null;
            this.currentEditingType = 'story';
            this.renderStoryDetail();
        };
    }
    
    renderStoryDetail(id = null) {
        const arc = id ? this.data.storyArcs.find(a => a.id === id) : {
            id: Date.now().toString(),
            name: 'New Story Arc',
            stages: []
        };
        
        document.getElementById('story-detail-container').innerHTML = `
            <div class="form-grid">
                <div class="form-section">
                    <h3>Story Arc Basics</h3>
                    <div class="form-group">
                        <label>Arc Name</label>
                        <input type="text" id="arc-name" value="${arc.name}" placeholder="Story arc name">
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Stages</h3>
                    <div class="stages-container">
                        ${arc.stages.map((stage, index) => `
                            <div class="stage-item" data-index="${index}">
                                <div class="stage-header">
                                    <div class="stage-title">
                                        <i class="fas fa-grip-lines"></i>
                                        <input type="text" class="stage-name" value="${stage.name}" placeholder="Stage name">
                                    </div>
                                    <div class="stage-actions">
                                        <button class="btn-icon edit-stage"><i class="fas fa-edit"></i></button>
                                        <button class="btn-icon delete-stage"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                                <div class="stage-details" style="display: none;">
                                    <div class="form-group">
                                        <label>Stage Type</label>
                                        <select class="stage-type">
                                            <option value="story" ${stage.type === 'story' ? 'selected' : ''}>Story</option>
                                            <option value="battle" ${stage.type === 'battle' ? 'selected' : ''}>Battle</option>
                                        </select>
                                    </div>
                                    
                                    <div class="stage-dialogs">
                                        <h4>Dialogs</h4>
                                        ${stage.dialogs && stage.dialogs.length > 0 ? 
                                            stage.dialogs.map((dialog, dIndex) => `
                                                <div class="dialog-item" data-index="${dIndex}">
                                                    <div class="dialog-header">
                                                        <div class="dialog-character">
                                                            <label>Character</label>
                                                            <select class="dialog-character-select">
                                                                <option value="">Narrator</option>
                                                                ${this.data.characters.map(c => `
                                                                    <option value="${c.id}" ${dialog.characterId === c.id ? 'selected' : ''}>${c.name}</option>
                                                                `).join('')}
                                                            </select>
                                                        </div>
                                                        <div class="dialog-actions">
                                                            <button class="btn-icon edit-dialog"><i class="fas fa-edit"></i></button>
                                                            <button class="btn-icon delete-dialog"><i class="fas fa-trash"></i></button>
                                                        </div>
                                                    </div>
                                                    <div class="dialog-content" style="display: none;">
                                                        <div class="form-group">
                                                            <label>Text</label>
                                                            <textarea class="dialog-text" rows="3">${dialog.text || ''}</textarea>
                                                        </div>
                                                        ${dialog.choices && dialog.choices.length > 0 ? `
                                                            <div class="dialog-choices">
                                                                ${dialog.choices.map((choice, cIndex) => `
                                                                    <div class="choice-item" data-index="${cIndex}">
                                                                        <div class="form-group">
                                                                            <label>Choice Text</label>
                                                                            <input type="text" class="choice-text" value="${choice.text}" placeholder="Choice text">
                                                                        </div>
                                                                        <div class="form-group">
                                                                            <label>Next Dialog</label>
                                                                            <input type="number" class="choice-next" value="${choice.nextDialog}" min="0" placeholder="Dialog index">
                                                                        </div>
                                                                        <button class="btn-icon remove-choice"><i class="fas fa-trash"></i></button>
                                                                    </div>
                                                                `).join('')}
                                                                <button class="btn btn-secondary add-choice"><i class="fas fa-plus"></i> Add Choice</button>
                                                            </div>
                                                        ` : ''}
                                                        <button class="btn btn-secondary add-choice-inline" style="${dialog.choices && dialog.choices.length > 0 ? 'display: none;' : ''}">
                                                            <i class="fas fa-plus"></i> Add Choice
                                                        </button>
                                                    </div>
                                                </div>
                                            `).join('') : `
                                                <div class="empty-state" style="padding: 10px;">
                                                    <i class="fas fa-comment"></i>
                                                    <p>No dialogs added yet</p>
                                                </div>
                                            `}
                                        <button class="btn btn-secondary add-dialog"><i class="fas fa-plus"></i> Add Dialog</button>
                                    </div>
                                    
                                    ${stage.type === 'battle' ? `
                                        <div class="stage-battle">
                                            <h4>Battle Setup</h4>
                                            <div class="form-group">
                                                <label>Enemies</label>
                                                <div class="enemies-container">
                                                    ${stage.enemies && stage.enemies.length > 0 ? 
                                                        stage.enemies.map((enemy, eIndex) => `
                                                            <div class="enemy-item" data-index="${eIndex}">
                                                                <div class="enemy-header">
                                                                    <div class="enemy-character">
                                                                        <label>Character</label>
                                                                        <select class="enemy-character">
                                                                            ${this.data.characters.map(c => `
                                                                                <option value="${c.id}" ${enemy.characterId === c.id ? 'selected' : ''}>${c.name} (${c.rarity})</option>
                                                                            `).join('')}
                                                                        </select>
                                                                    </div>
                                                                    <div class="enemy-actions">
                                                                        <button class="btn-icon delete-enemy"><i class="fas fa-trash"></i></button>
                                                                    </div>
                                                                </div>
                                                                <div class="enemy-details">
                                                                    <div class="form-group">
                                                                        <label>Level</label>
                                                                        <input type="number" class="enemy-level" value="${enemy.level}" min="1">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        `).join('') : `
                                                            <div class="empty-state" style="padding: 10px;">
                                                                <i class="fas fa-user-ninja"></i>
                                                                <p>No enemies added yet</p>
                                                            </div>
                                                        `}
                                                    <button class="btn btn-secondary add-enemy"><i class="fas fa-plus"></i> Add Enemy</button>
                                                </div>
                                            </div>
                                            
                                            <div class="form-group">
                                                <label>Conditional Dialogs</label>
                                                <div class="conditional-dialogs">
                                                    ${stage.conditionalDialogs && stage.conditionalDialogs.length > 0 ? 
                                                        stage.conditionalDialogs.map((cond, cIndex) => `
                                                            <div class="conditional-item" data-index="${cIndex}">
                                                                <div class="form-group">
                                                                    <label>Condition</label>
                                                                    <input type="text" class="condition" value="${cond.condition}" placeholder="enemy.health < 0.5">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Dialog Index</label>
                                                                    <input type="number" class="dialog-index" value="${cond.dialogIndex}" min="0">
                                                                </div>
                                                                <button class="btn-icon remove-conditional"><i class="fas fa-trash"></i></button>
                                                            </div>
                                                        `).join('') : `
                                                            <div class="empty-state" style="padding: 10px;">
                                                                <i class="fas fa-code"></i>
                                                                <p>No conditional dialogs added yet</p>
                                                            </div>
                                                        `}
                                                    <button class="btn btn-secondary add-conditional"><i class="fas fa-plus"></i> Add Conditional Dialog</button>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                        <button id="add-stage" class="btn btn-secondary"><i class="fas fa-plus"></i> Add Stage</button>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button id="save-story" class="btn btn-success">
                    <i class="fas fa-save"></i> ${id ? 'Save Changes' : 'Create Arc'}
                </button>
                ${id ? `
                <button id="delete-story" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Delete Arc
                </button>
                ` : ''}
            </div>
        `;
        
        // Setup stage editing
        document.querySelectorAll('.edit-stage').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const stageItem = btn.closest('.stage-item');
                const details = stageItem.querySelector('.stage-details');
                const isHidden = details.style.display === 'none';
                
                details.style.display = isHidden ? 'block' : 'none';
                btn.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-edit"></i>';
            });
        });
        
        // Setup stage deletion
        document.querySelectorAll('.delete-stage').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this stage?')) {
                    const stageItem = btn.closest('.stage-item');
                    stageItem.remove();
                }
            });
        });
        
        // Setup dialog editing
        document.querySelectorAll('.edit-dialog').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dialogItem = btn.closest('.dialog-item');
                const content = dialogItem.querySelector('.dialog-content');
                const isHidden = content.style.display === 'none';
                
                content.style.display = isHidden ? 'block' : 'none';
                btn.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-edit"></i>';
            });
        });
        
        // Setup dialog deletion
        document.querySelectorAll('.delete-dialog').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this dialog?')) {
                    const dialogItem = btn.closest('.dialog-item');
                    dialogItem.remove();
                    
                    // If no dialogs left, show empty state
                    const dialogsContainer = dialogItem.closest('.stage-dialogs');
                    if (dialogsContainer.querySelectorAll('.dialog-item').length === 0) {
                        dialogsContainer.querySelector('.empty-state').style.display = 'block';
                    }
                }
            });
        });
        
        // Setup add dialog button
        document.querySelectorAll('.add-dialog').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dialogsContainer = btn.closest('.stage-dialogs');
                const emptyState = dialogsContainer.querySelector('.empty-state');
                
                if (emptyState) emptyState.style.display = 'none';
                
                const newDialog = document.createElement('div');
                newDialog.className = 'dialog-item';
                newDialog.innerHTML = `
                    <div class="dialog-header">
                        <div class="dialog-character">
                            <label>Character</label>
                            <select class="dialog-character-select">
                                <option value="">Narrator</option>
                                ${this.data.characters.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="dialog-actions">
                            <button class="btn-icon edit-dialog"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon delete-dialog"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="dialog-content">
                        <div class="form-group">
                            <label>Text</label>
                            <textarea class="dialog-text" rows="3" placeholder="Dialog text"></textarea>
                        </div>
                        <div class="dialog-choices">
                            <div class="choice-item">
                                <div class="form-group">
                                    <label>Choice Text</label>
                                    <input type="text" class="choice-text" placeholder="Choice text">
                                </div>
                                <div class="form-group">
                                    <label>Next Dialog</label>
                                    <input type="number" class="choice-next" min="0" placeholder="Dialog index">
                                </div>
                                <button class="btn-icon remove-choice"><i class="fas fa-trash"></i></button>
                            </div>
                            <button class="btn btn-secondary add-choice"><i class="fas fa-plus"></i> Add Choice</button>
                        </div>
                    </div>
                `;
                
                btn.parentNode.insertBefore(newDialog, btn);
                
                // Setup event listeners for the new dialog
                this.setupNewDialogEvents(newDialog);
            });
        });
        
        // Setup add choice buttons for existing dialogs
        document.querySelectorAll('.add-choice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const choicesContainer = btn.closest('.dialog-choices');
                const newChoice = document.createElement('div');
                newChoice.className = 'choice-item';
                newChoice.innerHTML = `
                    <div class="form-group">
                        <label>Choice Text</label>
                        <input type="text" class="choice-text" placeholder="Choice text">
                    </div>
                    <div class="form-group">
                        <label>Next Dialog</label>
                        <input type="number" class="choice-next" min="0" placeholder="Dialog index">
                    </div>
                    <button class="btn-icon remove-choice"><i class="fas fa-trash"></i></button>
                `;
                
                btn.parentNode.insertBefore(newChoice, btn);
                
                // Setup remove button
                newChoice.querySelector('.remove-choice').addEventListener('click', () => {
                    newChoice.remove();
                    
                    // If only one choice left, hide the remove button for the remaining choice
                    if (choicesContainer.querySelectorAll('.choice-item').length === 1) {
                        choicesContainer.querySelector('.remove-choice').style.display = 'none';
                    }
                });
            });
        });
        
        // Setup add choice inline buttons
        document.querySelectorAll('.add-choice-inline').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dialogContent = btn.closest('.dialog-content');
                const choicesContainer = dialogContent.querySelector('.dialog-choices');
                
                choicesContainer.style.display = 'block';
                btn.style.display = 'none';
                
                // Add first choice
                const newChoice = document.createElement('div');
                newChoice.className = 'choice-item';
                newChoice.innerHTML = `
                    <div class="form-group">
                        <label>Choice Text</label>
                        <input type="text" class="choice-text" placeholder="Choice text">
                    </div>
                    <div class="form-group">
                        <label>Next Dialog</label>
                        <input type="number" class="choice-next" min="0" placeholder="Dialog index">
                    </div>
                    <button class="btn-icon remove-choice"><i class="fas fa-trash"></i></button>
                `;
                
                choicesContainer.appendChild(newChoice);
                
                // Setup remove button
                newChoice.querySelector('.remove-choice').addEventListener('click', () => {
                    newChoice.remove();
                    
                    // If no choices left, hide the choices container and show the inline button
                    if (choicesContainer.querySelectorAll('.choice-item').length === 0) {
                        choicesContainer.style.display = 'none';
                        btn.style.display = 'block';
                    }
                });
            });
        });
        
        // Setup remove choice buttons
        document.querySelectorAll('.remove-choice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const choiceItem = btn.closest('.choice-item');
                choiceItem.remove();
                
                // If only one choice left, hide the remove button for the remaining choice
                const choicesContainer = choiceItem.closest('.dialog-choices');
                if (choicesContainer && choicesContainer.querySelectorAll('.choice-item').length === 1) {
                    choicesContainer.querySelector('.remove-choice').style.display = 'none';
                }
            });
        });
        
        // Setup add stage button
        document.getElementById('add-stage').addEventListener('click', () => {
            const stagesContainer = document.querySelector('.stages-container');
            const newStage = document.createElement('div');
            newStage.className = 'stage-item';
            newStage.innerHTML = `
                <div class="stage-header">
                    <div class="stage-title">
                        <i class="fas fa-grip-lines"></i>
                        <input type="text" class="stage-name" value="New Stage" placeholder="Stage name">
                    </div>
                    <div class="stage-actions">
                        <button class="btn-icon edit-stage"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-stage"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="stage-details" style="display: block;">
                    <div class="form-group">
                        <label>Stage Type</label>
                        <select class="stage-type">
                            <option value="story">Story</option>
                            <option value="battle">Battle</option>
                        </select>
                    </div>
                    
                    <div class="stage-dialogs">
                        <h4>Dialogs</h4>
                        <div class="empty-state" style="padding: 10px;">
                            <i class="fas fa-comment"></i>
                            <p>No dialogs added yet</p>
                        </div>
                        <button class="btn btn-secondary add-dialog"><i class="fas fa-plus"></i> Add Dialog</button>
                    </div>
                </div>
            `;
            
            stagesContainer.insertBefore(newStage, document.getElementById('add-stage'));
            
            // Setup event listeners for the new stage
            this.setupNewStageEvents(newStage);
        });
        
        // Setup add enemy buttons
        document.querySelectorAll('.add-enemy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const enemiesContainer = btn.closest('.enemies-container');
                const emptyState = enemiesContainer.querySelector('.empty-state');
                
                if (emptyState) emptyState.style.display = 'none';
                
                const newEnemy = document.createElement('div');
                newEnemy.className = 'enemy-item';
                newEnemy.innerHTML = `
                    <div class="enemy-header">
                        <div class="enemy-character">
                            <label>Character</label>
                            <select class="enemy-character">
                                ${this.data.characters.map(c => `<option value="${c.id}">${c.name} (${c.rarity})</option>`).join('')}
                            </select>
                        </div>
                        <div class="enemy-actions">
                            <button class="btn-icon delete-enemy"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="enemy-details">
                        <div class="form-group">
                            <label>Level</label>
                            <input type="number" class="enemy-level" value="1" min="1">
                        </div>
                    </div>
                `;
                
                btn.parentNode.insertBefore(newEnemy, btn);
                
                // Setup delete button
                newEnemy.querySelector('.delete-enemy').addEventListener('click', () => {
                    newEnemy.remove();
                    
                    // If no enemies left, show empty state
                    if (enemiesContainer.querySelectorAll('.enemy-item').length === 0) {
                        enemiesContainer.querySelector('.empty-state').style.display = 'block';
                    }
                });
            });
        });
        
        // Setup add conditional dialog buttons
        document.querySelectorAll('.add-conditional').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const container = btn.closest('.conditional-dialogs');
                const emptyState = container.querySelector('.empty-state');
                
                if (emptyState) emptyState.style.display = 'none';
                
                const newItem = document.createElement('div');
                newItem.className = 'conditional-item';
                newItem.innerHTML = `
                    <div class="form-group">
                        <label>Condition</label>
                        <input type="text" class="condition" placeholder="enemy.health < 0.5">
                    </div>
                    <div class="form-group">
                        <label>Dialog Index</label>
                        <input type="number" class="dialog-index" min="0" placeholder="Dialog index">
                    </div>
                    <button class="btn-icon remove-conditional"><i class="fas fa-trash"></i></button>
                `;
                
                btn.parentNode.insertBefore(newItem, btn);
                
                // Setup remove button
                newItem.querySelector('.remove-conditional').addEventListener('click', () => {
                    newItem.remove();
                    
                    // If no items left, show empty state
                    if (container.querySelectorAll('.conditional-item').length === 0) {
                        container.querySelector('.empty-state').style.display = 'block';
                    }
                });
            });
        });
        
        // Setup remove conditional buttons
        document.querySelectorAll('.remove-conditional').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.conditional-item');
                item.remove();
                
                // If no items left, show empty state
                const container = item.closest('.conditional-dialogs');
                if (container.querySelectorAll('.conditional-item').length === 0) {
                    container.querySelector('.empty-state').style.display = 'block';
                }
            });
        });
        
        // Setup save button
        document.getElementById('save-story').addEventListener('click', () => {
            const updatedArc = {
                id: arc.id,
                name: document.getElementById('arc-name').value,
                stages: []
            };
            
            // Collect stage data
            document.querySelectorAll('.stage-item').forEach((stageItem, index) => {
                const stageName = stageItem.querySelector('.stage-name').value;
                const stageType = stageItem.querySelector('.stage-type').value;
                
                const stage = {
                    name: stageName,
                    type: stageType,
                    dialogs: []
                };
                
                // Collect dialog data
                stageItem.querySelectorAll('.dialog-item').forEach(dialogItem => {
                    const characterId = dialogItem.querySelector('.dialog-character-select').value;
                    const text = dialogItem.querySelector('.dialog-text').value;
                    
                    const dialog = {
                        characterId: characterId,
                        text: text,
                        choices: []
                    };
                    
                    // Collect choice data
                    dialogItem.querySelectorAll('.choice-item').forEach(choiceItem => {
                        const choiceText = choiceItem.querySelector('.choice-text').value;
                        const nextDialog = parseInt(choiceItem.querySelector('.choice-next').value) || 0;
                        
                        dialog.choices.push({
                            text: choiceText,
                            nextDialog: nextDialog
                        });
                    });
                    
                    stage.dialogs.push(dialog);
                });
                
                // Collect battle data if it's a battle stage
                if (stageType === 'battle') {
                    stage.enemies = [];
                    stage.conditionalDialogs = [];
                    
                    // Collect enemy data
                    stageItem.querySelectorAll('.enemy-item').forEach(enemyItem => {
                        const characterId = enemyItem.querySelector('.enemy-character').value;
                        const level = parseInt(enemyItem.querySelector('.enemy-level').value) || 1;
                        
                        stage.enemies.push({
                            characterId: characterId,
                            level: level
                        });
                    });
                    
                    // Collect conditional dialog data
                    stageItem.querySelectorAll('.conditional-item').forEach(condItem => {
                        const condition = condItem.querySelector('.condition').value;
                        const dialogIndex = parseInt(condItem.querySelector('.dialog-index').value) || 0;
                        
                        stage.conditionalDialogs.push({
                            condition: condition,
                            dialogIndex: dialogIndex
                        });
                    });
                }
                
                updatedArc.stages.push(stage);
            });
            
            if (id) {
                // Update existing arc
                const index = this.data.storyArcs.findIndex(a => a.id === id);
                this.data.storyArcs[index] = updatedArc;
            } else {
                // Add new arc
                this.data.storyArcs.push(updatedArc);
            }
            
            this.saveToLocalStorage();
            this.render();
        });
        
        // Setup delete button if editing
        if (id) {
            document.getElementById('delete-story').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this story arc?')) {
                    this.data.storyArcs = this.data.storyArcs.filter(a => a.id !== id);
                    this.saveToLocalStorage();
                    this.render();
                }
            });
        }
    }
    
    setupNewStageEvents(stageElement) {
        // Setup stage editing
        stageElement.querySelector('.edit-stage').addEventListener('click', (e) => {
            e.stopPropagation();
            const details = stageElement.querySelector('.stage-details');
            const isHidden = details.style.display === 'none';
            
            details.style.display = isHidden ? 'block' : 'none';
            e.target.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-edit"></i>';
        });
        
        // Setup stage deletion
        stageElement.querySelector('.delete-stage').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this stage?')) {
                stageElement.remove();
            }
        });
        
        // Setup add dialog button
        stageElement.querySelector('.add-dialog').addEventListener('click', (e) => {
            e.stopPropagation();
            const dialogsContainer = stageElement.querySelector('.stage-dialogs');
            const emptyState = dialogsContainer.querySelector('.empty-state');
            
            if (emptyState) emptyState.style.display = 'none';
            
            const newDialog = document.createElement('div');
            newDialog.className = 'dialog-item';
            newDialog.innerHTML = `
                <div class="dialog-header">
                    <div class="dialog-character">
                        <label>Character</label>
                        <select class="dialog-character-select">
                            <option value="">Narrator</option>
                            ${this.data.characters.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="dialog-actions">
                        <button class="btn-icon edit-dialog"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-dialog"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="dialog-content">
                    <div class="form-group">
                        <label>Text</label>
                        <textarea class="dialog-text" rows="3" placeholder="Dialog text"></textarea>
                    </div>
                    <div class="dialog-choices">
                        <div class="choice-item">
                            <div class="form-group">
                                <label>Choice Text</label>
                                <input type="text" class="choice-text" placeholder="Choice text">
                            </div>
                            <div class="form-group">
                                <label>Next Dialog</label>
                                <input type="number" class="choice-next" min="0" placeholder="Dialog index">
                            </div>
                            <button class="btn-icon remove-choice"><i class="fas fa-trash"></i></button>
                        </div>
                        <button class="btn btn-secondary add-choice"><i class="fas fa-plus"></i> Add Choice</button>
                    </div>
                </div>
            `;
            
            dialogsContainer.insertBefore(newDialog, stageElement.querySelector('.add-dialog'));
            
            // Setup event listeners for the new dialog
            this.setupNewDialogEvents(newDialog);
        });
        
        // Setup stage type change
        stageElement.querySelector('.stage-type').addEventListener('change', (e) => {
            const stageDetails = stageElement.querySelector('.stage-details');
            const stageType = e.target.value;
            
            // Remove existing battle content if it exists
            const existingBattle = stageDetails.querySelector('.stage-battle');
            if (existingBattle) existingBattle.remove();
            
            if (stageType === 'battle') {
                // Add battle content
                const battleContent = document.createElement('div');
                battleContent.className = 'stage-battle';
                battleContent.innerHTML = `
                    <h4>Battle Setup</h4>
                    <div class="form-group">
                        <label>Enemies</label>
                        <div class="enemies-container">
                            <div class="empty-state" style="padding: 10px;">
                                <i class="fas fa-user-ninja"></i>
                                <p>No enemies added yet</p>
                            </div>
                            <button class="btn btn-secondary add-enemy"><i class="fas fa-plus"></i> Add Enemy</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Conditional Dialogs</label>
                        <div class="conditional-dialogs">
                            <div class="empty-state" style="padding: 10px;">
                                <i class="fas fa-code"></i>
                                <p>No conditional dialogs added yet</p>
                            </div>
                            <button class="btn btn-secondary add-conditional"><i class="fas fa-plus"></i> Add Conditional Dialog</button>
                        </div>
                    </div>
                `;
                
                stageDetails.appendChild(battleContent);
                
                // Setup add enemy button
                battleContent.querySelector('.add-enemy').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const enemiesContainer = battleContent.querySelector('.enemies-container');
                    const emptyState = enemiesContainer.querySelector('.empty-state');
                    
                    if (emptyState) emptyState.style.display = 'none';
                    
                    const newEnemy = document.createElement('div');
                    newEnemy.className = 'enemy-item';
                    newEnemy.innerHTML = `
                        <div class="enemy-header">
                            <div class="enemy-character">
                                <label>Character</label>
                                <select class="enemy-character">
                                    ${this.data.characters.map(c => `<option value="${c.id}">${c.name} (${c.rarity})</option>`).join('')}
                                </select>
                            </div>
                            <div class="enemy-actions">
                                <button class="btn-icon delete-enemy"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <div class="enemy-details">
                            <div class="form-group">
                                <label>Level</label>
                                <input type="number" class="enemy-level" value="1" min="1">
                            </div>
                        </div>
                    `;
                    
                    enemiesContainer.insertBefore(newEnemy, battleContent.querySelector('.add-enemy'));
                    
                    // Setup delete button
                    newEnemy.querySelector('.delete-enemy').addEventListener('click', () => {
                        newEnemy.remove();
                        
                        // If no enemies left, show empty state
                        if (enemiesContainer.querySelectorAll('.enemy-item').length === 0) {
                            enemiesContainer.querySelector('.empty-state').style.display = 'block';
                        }
                    });
                });
                
                // Setup add conditional dialog button
                battleContent.querySelector('.add-conditional').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const container = battleContent.querySelector('.conditional-dialogs');
                    const emptyState = container.querySelector('.empty-state');
                    
                    if (emptyState) emptyState.style.display = 'none';
                    
                    const newItem = document.createElement('div');
                    newItem.className = 'conditional-item';
                    newItem.innerHTML = `
                        <div class="form-group">
                            <label>Condition</label>
                            <input type="text" class="condition" placeholder="enemy.health < 0.5">
                        </div>
                        <div class="form-group">
                            <label>Dialog Index</label>
                            <input type="number" class="dialog-index" min="0" placeholder="Dialog index">
                        </div>
                        <button class="btn-icon remove-conditional"><i class="fas fa-trash"></i></button>
                    `;
                    
                    container.insertBefore(newItem, battleContent.querySelector('.add-conditional'));
                    
                    // Setup remove button
                    newItem.querySelector('.remove-conditional').addEventListener('click', () => {
                        newItem.remove();
                        
                        // If no items left, show empty state
                        if (container.querySelectorAll('.conditional-item').length === 0) {
                            container.querySelector('.empty-state').style.display = 'block';
                        }
                    });
                });
            }
        });
    }
    
    setupNewDialogEvents(dialogElement) {
        // Setup dialog editing
        dialogElement.querySelector('.edit-dialog').addEventListener('click', (e) => {
            e.stopPropagation();
            const content = dialogElement.querySelector('.dialog-content');
            const isHidden = content.style.display === 'none';
            
            content.style.display = isHidden ? 'block' : 'none';
            e.target.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-edit"></i>';
        });
        
        // Setup dialog deletion
        dialogElement.querySelector('.delete-dialog').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this dialog?')) {
                dialogElement.remove();
                
                // If no dialogs left, show empty state
                const dialogsContainer = dialogElement.closest('.stage-dialogs');
                if (dialogsContainer && dialogsContainer.querySelectorAll('.dialog-item').length === 0) {
                    dialogsContainer.querySelector('.empty-state').style.display = 'block';
                }
            }
        });
        
        // Setup add choice button
        dialogElement.querySelector('.add-choice').addEventListener('click', (e) => {
            e.stopPropagation();
            const choicesContainer = dialogElement.querySelector('.dialog-choices');
            const newChoice = document.createElement('div');
            newChoice.className = 'choice-item';
            newChoice.innerHTML = `
                <div class="form-group">
                    <label>Choice Text</label>
                    <input type="text" class="choice-text" placeholder="Choice text">
                </div>
                <div class="form-group">
                    <label>Next Dialog</label>
                    <input type="number" class="choice-next" min="0" placeholder="Dialog index">
                </div>
                <button class="btn-icon remove-choice"><i class="fas fa-trash"></i></button>
            `;
            
            choicesContainer.insertBefore(newChoice, dialogElement.querySelector('.add-choice'));
            
            // Setup remove button
            newChoice.querySelector('.remove-choice').addEventListener('click', () => {
                newChoice.remove();
                
                // If only one choice left, hide the remove button for the remaining choice
                if (choicesContainer.querySelectorAll('.choice-item').length === 1) {
                    choicesContainer.querySelector('.remove-choice').style.display = 'none';
                }
            });
        });
        
        // Setup remove choice buttons
        dialogElement.querySelectorAll('.remove-choice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const choiceItem = btn.closest('.choice-item');
                choiceItem.remove();
                
                // If only one choice left, hide the remove button for the remaining choice
                const choicesContainer = choiceItem.closest('.dialog-choices');
                if (choicesContainer && choicesContainer.querySelectorAll('.choice-item').length === 1) {
                    choicesContainer.querySelector('.remove-choice').style.display = 'none';
                }
            });
        });
    }
    
    // ==================
    // SYSTEM MANAGEMENT
    // ==================
    
    renderSystem() {
        return `
            <div class="form-grid">
                <div class="form-section">
                    <h3>Currencies</h3>
                    <div class="currencies-container">
                        ${this.data.system.currencies.map(currency => `
                            <div class="currency-item" data-id="${currency.id}">
                                <div class="form-group">
                                    <label>Name</label>
                                    <input type="text" class="currency-name" value="${currency.name}" placeholder="Currency name">
                                </div>
                                <div class="form-group">
                                    <label>Starting Amount</label>
                                    <input type="number" class="currency-start" value="${currency.startAmount}" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Icon (Optional)</label>
                                    <div class="image-upload-container">
                                        <div class="image-preview" style="background-image: url('${currency.icon || ''}')">
                                            ${!currency.icon ? '<div class="image-placeholder">Drag & drop or click to upload</div>' : ''}
                                        </div>
                                        <input type="file" class="currency-icon-upload" accept="image/*" style="display: none;">
                                    </div>
                                </div>
                                <button class="btn-icon delete-currency"><i class="fas fa-trash"></i></button>
                            </div>
                        `).join('')}
                        <button id="add-currency" class="btn btn-secondary"><i class="fas fa-plus"></i> Add Currency</button>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Level Curve</h3>
                    <div class="level-curve-container">
                        <div class="form-group">
                            <label>Max Level</label>
                            <input type="number" id="max-level" value="${this.data.system.levelCurves[0]?.maxLevel || 100}" min="10" max="999">
                        </div>
                        <div class="form-group">
                            <label>Base Experience for Level 2</label>
                            <input type="number" id="base-exp" value="${this.data.system.levelCurves[0]?.baseExp || 100}" min="10">
                        </div>
                        <div class="form-group">
                            <label>Experience Growth Rate</label>
                            <input type="number" id="exp-growth" value="${this.data.system.levelCurves[0]?.growthRate || 1.2}" min="1.0" step="0.1">
                        </div>
                        
                        <div class="form-group">
                            <label>Experience Required per Level</label>
                            <div class="exp-chart">
                                <div class="chart-header">
                                    <div>Level</div>
                                    <div>Required EXP</div>
                                    <div>Cumulative EXP</div>
                                </div>
                                ${this.calculateLevelCurve().map((level, index) => `
                                    <div class="chart-row">
                                        <div>${index + 2}</div>
                                        <div>${level.required.toLocaleString()}</div>
                                        <div>${level.cumulative.toLocaleString()}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button id="save-system" class="btn btn-success">
                    <i class="fas fa-save"></i> Save System Settings
                </button>
            </div>
        `;
    }
    
    calculateLevelCurve() {
        const maxLevel = parseInt(document.getElementById('max-level').value) || 100;
        const baseExp = parseInt(document.getElementById('base-exp').value) || 100;
        const growthRate = parseFloat(document.getElementById('exp-growth').value) || 1.2;
        
        let cumulative = 0;
        const levels = [];
        
        for (let i = 2; i <= maxLevel; i++) {
            const required = Math.floor(baseExp * Math.pow(growthRate, i - 2));
            cumulative += required;
            
            levels.push({
                level: i,
                required: required,
                cumulative: cumulative
            });
        }
        
        return levels;
    }
    
    setupSystemUI() {
        // Setup add currency button
        document.getElementById('add-currency').addEventListener('click', () => {
            const currenciesContainer = document.querySelector('.currencies-container');
            const newCurrency = document.createElement('div');
            newCurrency.className = 'currency-item';
            newCurrency.innerHTML = `
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="currency-name" value="New Currency" placeholder="Currency name">
                </div>
                <div class="form-group">
                    <label>Starting Amount</label>
                    <input type="number" class="currency-start" value="0" min="0">
                </div>
                <div class="form-group">
                    <label>Icon (Optional)</label>
                    <div class="image-upload-container">
                        <div class="image-preview">
                            <div class="image-placeholder">Drag & drop or click to upload</div>
                        </div>
                        <input type="file" class="currency-icon-upload" accept="image/*" style="display: none;">
                    </div>
                </div>
                <button class="btn-icon delete-currency"><i class="fas fa-trash"></i></button>
            `;
            
            currenciesContainer.insertBefore(newCurrency, document.getElementById('add-currency'));
            
            // Setup delete button
            newCurrency.querySelector('.delete-currency').addEventListener('click', () => {
                newCurrency.remove();
            });
            
            // Setup image upload
            const imagePreview = newCurrency.querySelector('.image-preview');
            const imageUpload = newCurrency.querySelector('.currency-icon-upload');
            
            imagePreview.addEventListener('click', () => imageUpload.click());
            
            imageUpload.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = (event) => {
                        imagePreview.style.backgroundImage = `url('${event.target.result}')`;
                        imagePreview.querySelector('.image-placeholder')?.remove();
                    };
                    
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        });
        
        // Setup image upload for existing currencies
        document.querySelectorAll('.currency-item').forEach(item => {
            const imagePreview = item.querySelector('.image-preview');
            const imageUpload = item.querySelector('.currency-icon-upload');
            
            imagePreview.addEventListener('click', () => imageUpload.click());
            
            imageUpload.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = (event) => {
                        imagePreview.style.backgroundImage = `url('${event.target.result}')`;
                        imagePreview.querySelector('.image-placeholder')?.remove();
                    };
                    
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
            
            // Setup delete button
            item.querySelector('.delete-currency').addEventListener('click', () => {
                item.remove();
            });
        });
        
        // Setup level curve inputs
        document.getElementById('max-level').addEventListener('change', () => this.updateLevelCurve());
        document.getElementById('base-exp').addEventListener('change', () => this.updateLevelCurve());
        document.getElementById('exp-growth').addEventListener('change', () => this.updateLevelCurve());
        
        // Setup save button
        document.getElementById('save-system').addEventListener('click', () => {
            // Save currencies
            const currencies = [];
            document.querySelectorAll('.currency-item').forEach(item => {
                const name = item.querySelector('.currency-name').value;
                const startAmount = parseInt(item.querySelector('.currency-start').value) || 0;
                const icon = item.querySelector('.image-preview').style.backgroundImage
                    .replace('url("', '').replace('")', '').replace('url(', '').replace(')', '');
                
                currencies.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name: name,
                    startAmount: startAmount,
                    icon: icon
                });
            });
            
            // Save level curve
            const maxLevel = parseInt(document.getElementById('max-level').value) || 100;
            const baseExp = parseInt(document.getElementById('base-exp').value) || 100;
            const growthRate = parseFloat(document.getElementById('exp-growth').value) || 1.2;
            
            this.data.system = {
                currencies: currencies,
                levelCurves: [{
                    id: 'default',
                    name: 'Default',
                    maxLevel: maxLevel,
                    baseExp: baseExp,
                    growthRate: growthRate
                }]
            };
            
            this.saveToLocalStorage();
            alert('System settings saved successfully!');
        });
    }
    
    updateLevelCurve() {
        const levels = this.calculateLevelCurve();
        let chartHTML = `
            <div class="chart-header">
                <div>Level</div>
                <div>Required EXP</div>
                <div>Cumulative EXP</div>
            </div>
        `;
        
        levels.forEach(level => {
            chartHTML += `
                <div class="chart-row">
                    <div>${level.level}</div>
                    <div>${level.required.toLocaleString()}</div>
                    <div>${level.cumulative.toLocaleString()}</div>
                </div>
            `;
        });
        
        document.querySelector('.exp-chart').innerHTML = chartHTML;
    }
    
    // ================
    // HELPER METHODS
    // ================
    
    setupEventListeners() {
        // Category change
        document.getElementById('database-category')?.addEventListener('change', () => {
            this.render();
        });
        
        // Save button
        document.getElementById('save-db-btn')?.addEventListener('click', () => {
            this.saveToLocalStorage();
            alert('Database saved successfully!');
        });
    }
    
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('gachamaker-database');
        if (savedData) {
            this.data = JSON.parse(savedData);
        } else {
            // Initialize with some default data
            this.data = {
                characters: [],
                items: [],
                skills: [],
                factions: [
                    { id: '1', name: 'Fire', type: 'Element', color: '#e74c3c', weaknesses: [], resistances: [] },
                    { id: '2', name: 'Water', type: 'Element', color: '#3498db', weaknesses: [], resistances: [] },
                    { id: '3', name: 'Earth', type: 'Element', color: '#27ae60', weaknesses: [], resistances: [] },
                    { id: '4', name: 'Wind', type: 'Element', color: '#16a085', weaknesses: [], resistances: [] }
                ],
                gatchaBanners: [],
                achievements: [],
                storyArcs: [],
                system: {
                    currencies: [
                        { id: '1', name: 'Gems', startAmount: 100, icon: '' },
                        { id: '2', name: 'Coins', startAmount: 1000, icon: '' }
                    ],
                    levelCurves: [
                        { id: 'default', name: 'Default', maxLevel: 100, baseExp: 100, growthRate: 1.2 }
                    ]
                }
            };
        }
        
        // Update faction weaknesses/resistances to ensure they're arrays
        this.data.factions.forEach(faction => {
            if (!Array.isArray(faction.weaknesses)) faction.weaknesses = [];
            if (!Array.isArray(faction.resistances)) faction.resistances = [];
        });
    }
    
    saveToLocalStorage() {
        localStorage.setItem('gachamaker-database', JSON.stringify(this.data));
    }
    
    getContainer() {
        return this.container;
    }
}

// Initialize the database module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('database-module')) {
        const database = new Database();
        database.render();
    }
});
