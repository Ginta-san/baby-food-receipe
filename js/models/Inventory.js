class Inventory {
  constructor(foodItems = []) {
    this.foodItems = foodItems;
  }

  getAvailableItems(category = null) {
    let items = this.foodItems.filter(item => item.isAvailable);
    if (category) {
      items = items.filter(item => item.category === category);
    }
    return items;
  }

  toggleAvailability(foodItemId) {
    const item = this.foodItems.find(item => item.id === foodItemId);
    if (item) {
      item.isAvailable = !item.isAvailable;
      return true;
    }
    return false;
  }

  addCustomItem(name, category) {
    const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem = new FoodItem(customId, name, category, false, true);
    this.foodItems.push(newItem);
    return newItem;
  }

  getSortedItems() {
    return [...this.foodItems].sort((a, b) => {
      if (a.isAvailable === b.isAvailable) {
        return a.name.localeCompare(b.name, 'ja');
      }
      return a.isAvailable ? -1 : 1;
    });
  }

  getItemById(id) {
    return this.foodItems.find(item => item.id === id);
  }

  toJSON() {
    return {
      foodItems: this.foodItems.map(item => item.toJSON())
    };
  }

  static fromJSON(json) {
    const foodItems = json.foodItems.map(item => FoodItem.fromJSON(item));
    return new Inventory(foodItems);
  }

  static createDefault() {
    const foodItems = [];
    let idCounter = 1;

    Object.entries(PREDEFINED_FOODS).forEach(([category, foods]) => {
      foods.forEach(name => {
        const id = `${category}_${String(idCounter).padStart(3, '0')}`;
        foodItems.push(new FoodItem(id, name, category, false, false));
        idCounter++;
      });
    });

    return new Inventory(foodItems);
  }
}
