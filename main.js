// Core engine state
const Engine = {
  activeModule: 'editor',
  gameState: {
    gold: 0,
    cps: 0, // Clicks per second (idle)
    lastTick: Date.now()
  },
  modules: {}
};

// Load module dynamically
async function loadModule(name) {
  const module = await import(`./modules/${name}.js`);
  Engine.modules[name] = module;
  Engine.activeModule = name;
  
  // Update UI
  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === name);
  });
  
  document.getElementById('module-content').innerHTML = 
    module.render() || '<div class="placeholder">Module loaded!</div>';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.addEventListener('click', () => loadModule(btn.dataset.tab));
  });
  
  // Play test button
  document.getElementById('play-test').addEventListener('click', () => {
    Engine.gameState = { gold: 0, cps: 0, lastTick: Date.now() };
    document.getElementById('module-content').innerHTML = `
      <div class="idle-ui">
        <h2>Play Test</h2>
        <div>Gold: <span id="gold-count">0</span></div>
        <div>CPS: <span id="cps-count">0</span></div>
        <button class="idle-button">⛏️ Mine Gold</button>
        <button class="idle-button gacha-pull">💎 Gacha Pull</button>
      </div>
    `;
    
    // Start idle loop
    setInterval(updateGame, 100);
  });
  
  // Load default module
  loadModule('editor');
});

// Game loop (for play testing)
function updateGame() {
  const now = Date.now();
  const delta = (now - Engine.gameState.lastTick) / 1000;
  Engine.gameState.lastTick = now;
  
  // Add idle gold
  Engine.gameState.gold += Engine.gameState.cps * delta;
  
  // Update UI
  document.getElementById('gold-count').textContent = 
    Math.floor(Engine.gameState.gold).toLocaleString();
  document.getElementById('cps-count').textContent = 
    Engine.gameState.cps.toFixed(1);
}
