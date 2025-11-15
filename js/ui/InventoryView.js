class InventoryView {
  constructor(container, inventory, storageService) {
    this.container = container;
    this.inventory = inventory;
    this.storageService = storageService;
  }

  render() {
    const sortedItems = this.inventory.getSortedItems();
    
    const itemsByCategory = {};
    sortedItems.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });

    let html = `
      <div class="inventory-view">
        <h2 style="margin-bottom: 16px; font-size: 18px;">🥕 在庫管理</h2>
        
        <button class="btn btn-secondary" id="add-custom-item-btn" style="width: 100%; margin-bottom: 20px;">
          ➕ カスタム食材追加
        </button>
        
        <div id="custom-item-form" style="display: none; background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 12px;">新しい食材を追加</h3>
          <input type="text" id="custom-item-name" placeholder="食材名" style="width: 100%; padding: 10px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
          <select id="custom-item-category" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
            <option value="${CATEGORIES.OTHER}">その他</option>
            <option value="${CATEGORIES.CARB}">炭水化物</option>
            <option value="${CATEGORIES.PROTEIN}">タンパク質</option>
            <option value="${CATEGORIES.VEGETABLE}">野菜</option>
            <option value="${CATEGORIES.DAIRY}">乳製品</option>
            <option value="${CATEGORIES.FRUIT}">フルーツ</option>
          </select>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary" id="save-custom-item" style="flex: 1;">保存</button>
            <button class="btn btn-outline" id="cancel-custom-item" style="flex: 1;">キャンセル</button>
          </div>
        </div>
        
        <div class="inventory-list">
    `;

    Object.entries(itemsByCategory).forEach(([category, items]) => {
      html += `
        <div class="category-section" style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; color: #4CAF50; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e0e0e0;">
            ${category}
          </h3>
          <div class="item-list">
      `;

      items.forEach(item => {
        const checkmark = item.isAvailable ? '✓' : '○';
        const textColor = item.isAvailable ? '#4CAF50' : '#bdbdbd';
        const bgColor = item.isAvailable ? '#e8f5e9' : '#f5f5f5';
        
        html += `
          <div class="inventory-item" data-item-id="${item.id}" 
               style="padding: 12px; margin-bottom: 8px; background-color: ${bgColor}; border-radius: 8px; cursor: pointer; display: flex; align-items: center; min-height: 44px; transition: all 0.2s;">
            <span style="font-size: 20px; margin-right: 12px; color: ${textColor};">${checkmark}</span>
            <span style="flex: 1; color: ${textColor}; font-size: 15px;">${item.name}</span>
            ${item.isCustom ? '<span style="font-size: 12px; color: #999;">カスタム</span>' : ''}
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  attachEventListeners() {
    const items = this.container.querySelectorAll('.inventory-item');
    items.forEach(itemEl => {
      itemEl.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-item-id');
        this.onItemToggle(itemId);
      });
    });

    const addBtn = this.container.querySelector('#add-custom-item-btn');
    addBtn.addEventListener('click', () => this.showAddCustomItemForm());

    const saveBtn = this.container.querySelector('#save-custom-item');
    saveBtn.addEventListener('click', () => this.saveCustomItem());

    const cancelBtn = this.container.querySelector('#cancel-custom-item');
    cancelBtn.addEventListener('click', () => this.hideAddCustomItemForm());
  }

  onItemToggle(foodItemId) {
    this.inventory.toggleAvailability(foodItemId);
    this.storageService.saveInventory(this.inventory);
    this.render();
  }

  showAddCustomItemForm() {
    const form = this.container.querySelector('#custom-item-form');
    form.style.display = 'block';
    this.container.querySelector('#custom-item-name').focus();
  }

  hideAddCustomItemForm() {
    const form = this.container.querySelector('#custom-item-form');
    form.style.display = 'none';
    this.container.querySelector('#custom-item-name').value = '';
  }

  saveCustomItem() {
    const nameInput = this.container.querySelector('#custom-item-name');
    const categorySelect = this.container.querySelector('#custom-item-category');
    
    const name = nameInput.value.trim();
    const category = categorySelect.value;

    if (!name) {
      alert('食材名を入力してください');
      return;
    }

    this.inventory.addCustomItem(name, category);
    this.storageService.saveInventory(this.inventory);
    this.hideAddCustomItemForm();
    this.render();
  }
}
