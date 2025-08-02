export const DB = {
  items: [
    { id: 1, name: "Pickaxe", type: "clicker", baseValue: 1 },
    { id: 2, name: "Gold Mine", type: "idle", baseValue: 0.5, cost: 10 }
  ],
  gachaPools: [
    {
      id: 1,
      name: "Starter Pool",
      odds: [
        { item: "Common", chance: 70, value: 1 },
        { item: "Rare", chance: 25, value: 5 },
        { item: "Epic", chance: 5, value: 20 }
      ]
    }
  ]
};

export function render() {
  return `
    <h2>Database</h2>
    <div class="db-tabs">
      <button data-db="items">Items</button>
      <button data-db="gacha">Gacha Pools</button>
    </div>
    <div id="db-content">
      <table>
        <tr><th>ID</th><th>Name</th><th>Type</th><th>Value</th></tr>
        ${DB.items.map(item => `
          <tr>
            <td>${item.id}</td>
            <td><input type="text" value="${item.name}"></td>
            <td>${item.type}</td>
            <td><input type="number" value="${item.baseValue}"></td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}
