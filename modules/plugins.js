// modules/plugins.js
export function render() {
  return `
    <h2>Plugin Manager</h2>
    <div class="plugin-list">
      <div class="plugin-item">
        <h3>Idle Analytics</h3>
        <p>Track player idle behavior</p>
        <button data-plugin="analytics">Load</button>
      </div>
      <div class="plugin-item">
        <h3>Gacha Sound FX</h3>
        <p>Add audio to pulls</p>
        <button data-plugin="sound">Load</button>
      </div>
    </div>
  `;
}

document.querySelectorAll('[data-plugin]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const plugin = e.target.dataset.plugin;
    // Load plugin from GitHub (simulated)
    alert(`Loaded plugin: ${plugin}\nIn real version: fetches from /plugins/${plugin}.js`);
  });
});
