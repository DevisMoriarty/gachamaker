export function render() {
  return `
    <h2>Event Editor</h2>
    <div class="event-list">
      <div class="event-item" draggable="true">
        <strong>On Click</strong> - Add 1 gold
      </div>
      <div class="event-item" draggable="true">
        <strong>Every 5s</strong> - Generate idle gold
      </div>
      <div class="event-item" draggable="true">
        <strong>Gacha Pull</strong> - Random reward
      </div>
    </div>
    <div class="event-triggers">
      <h3>Triggers</h3>
      <div id="trigger-zone" style="min-height: 200px; border: 1px dashed #555; padding: 10px;">
        Drop events here
      </div>
    </div>
  `;
}

// Event execution logic (used in play test)
export function executeEvent(eventType) {
  switch(eventType) {
    case 'click':
      Engine.gameState.gold += 1;
      break;
    case 'idle':
      Engine.gameState.cps += 0.1;
      break;
    case 'gacha':
      // Simple gacha simulation
      const pool = DB.gachaPools[0];
      const rand = Math.random() * 100;
      let cumulative = 0;
      for (const item of pool.odds) {
        cumulative += item.chance;
        if (rand <= cumulative) {
          Engine.gameState.gold += item.value;
          alert(`Gacha: ${item.item}! +${item.value} gold`);
          break;
        }
      }
      break;
  }
}

// Initialize event handlers
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.event-item').forEach(item => {
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('event', item.textContent.split(' - ')[0].slice(1, -1));
    });
  });
  
  document.getElementById('trigger-zone').addEventListener('drop', e => {
    e.preventDefault();
    const eventType = e.dataTransfer.getData('event');
    alert(`Added trigger: ${eventType}`);
    
    // In real version: bind to play-test buttons
    if(eventType === 'Click') {
      document.querySelector('.idle-button:not(.gacha-pull)').onclick = 
        () => executeEvent('click');
    }
  });
});
