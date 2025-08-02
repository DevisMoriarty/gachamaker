export function render() {
  return `
    <h2>Scene Editor</h2>
    <div class="editor-toolbar">
      <button data-tool="clicker">⛏️ Clicker</button>
      <button data-tool="gacha">💎 Gacha Machine</button>
      <button data-tool="idle">⏱️ Idle Producer</button>
    </div>
    <div id="scene-canvas" style="height: 400px; background: #333; margin-top: 20px; border: 1px dashed #555;">
      Drag elements here
    </div>
    <div class="settings-panel">
      <h3>Element Properties</h3>
      <div id="element-props">
        Select an element to edit
      </div>
    </div>
  `;
}

// Initialize editor UI
export function init() {
  document.querySelectorAll('.editor-toolbar button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      alert(`Added ${e.target.dataset.tool} to scene!`);
      // In real version: drag/drop logic here
    });
  });
}

// Auto-init on load
document.addEventListener('DOMContentLoaded', init);
