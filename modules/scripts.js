// modules/scripts.js
export function render() {
  return `
    <h2>Custom Scripts</h2>
    <textarea id="script-editor" style="width:100%; height:300px; background:#222; color:#0f0; font-family:monospace">
// Auto-applied during play test
Engine.gameState.cps += 0.5; // +0.5 CPS
    </textarea>
    <button id="run-script">Apply Script</button>
  `;
}

document.getElementById('run-script')?.addEventListener('click', () => {
  try {
    eval(document.getElementById('script-editor').value);
    alert('Script applied!');
  } catch(e) {
    alert('Error: ' + e.message);
  }
});
