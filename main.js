// main.js

document.addEventListener('DOMContentLoaded', function() {
    // Module switching functionality
    const moduleItems = document.querySelectorAll('.module-item');
    const moduleContainers = document.querySelectorAll('.module-container');
    
    // Add click event to each module item
    moduleItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            moduleItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get target module
            const targetModule = this.getAttribute('data-module');
            
            // Hide all module containers
            moduleContainers.forEach(container => {
                container.classList.remove('active');
            });
            
            // Show target module
            document.getElementById(`${targetModule}-module`).classList.add('active');
        });
    });
    
    // Modal functionality
    const modal = document.getElementById('ability-modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Save project button
    document.getElementById('save-project').addEventListener('click', function() {
        // This would save the project data to localStorage or IndexedDB
        alert('Project saved successfully!');
        document.querySelector('.status-indicator').style.backgroundColor = 'var(--success)';
        document.querySelector('.status span').textContent = 'Saved';
        
        setTimeout(() => {
            document.querySelector('.status span').textContent = 'Ready';
        }, 2000);
    });
    
    // Test game button
    document.getElementById('test-game').addEventListener('click', function() {
        alert('Game test started!');
        document.querySelector('.status-indicator').style.backgroundColor = 'var(--info)';
        document.querySelector('.status span').textContent = 'Testing...';
        
        setTimeout(() => {
            document.querySelector('.status span').textContent = 'Ready';
            document.querySelector('.status-indicator').style.backgroundColor = 'var(--success)';
        }, 3000);
    });
    
    // Initialize database module
    if (typeof initDatabase === 'function') {
        initDatabase();
    }
});
