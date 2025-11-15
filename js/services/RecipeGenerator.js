class RecipeGenerator {
  constructor(inventory, historyService) {
    this.inventory = inventory;
    this.historyService = historyService;
  }

  generateRecipe(mealType) {
    const selectedItems = [];
    const recentlyUsedIds = this.historyService.getRecentlyUsedFoodIds(2);
    
    const carb = this.selectFromCategory(CATEGORIES.CARB, 1, recentlyUsedIds);
    if (carb.length === 0) {
      throw new Error('炭水化物の在庫が不足しています。在庫管理から追加してください。');
    }
    selectedItems.push(...carb);
    
    const protein = this.selectFromCategory(CATEGORIES.PROTEIN, 1, recentlyUsedIds);
    if (protein.length === 0) {
      throw new Error('タンパク質の在庫が不足しています。在庫管理から追加してください。');
    }
    selectedItems.push(...protein);
    
    const vegetables = this.selectFromCategory(CATEGORIES.VEGETABLE, 3, recentlyUsedIds);
    if (vegetables.length === 0) {
      throw new Error('野菜の在庫が不足しています。在庫管理から追加してください。');
    }
    selectedItems.push(...vegetables);
    
    if (mealType === MEAL_TYPES.BREAKFAST) {
      const availableFruits = this.inventory.getAvailableItems(CATEGORIES.FRUIT);
      const availableDairy = this.inventory.getAvailableItems(CATEGORIES.DAIRY);
      const yogurt = availableDairy.find(item => item.name === 'ヨーグルト');
      
      if (availableFruits.length > 0 && yogurt) {
        selectedItems.push(yogurt);
        const fruit = this.selectFromCategory(CATEGORIES.FRUIT, 1, recentlyUsedIds);
        selectedItems.push(...fruit);
      } else if (availableFruits.length > 0) {
        const fruit = this.selectFromCategory(CATEGORIES.FRUIT, 1, recentlyUsedIds);
        selectedItems.push(...fruit);
        
        const dairy = this.selectFromCategory(CATEGORIES.DAIRY, 1, recentlyUsedIds);
        selectedItems.push(...dairy);
      } else {
        const dairy = this.selectFromCategory(CATEGORIES.DAIRY, 1, recentlyUsedIds);
        selectedItems.push(...dairy);
      }
    } else {
      const dairy = this.selectFromCategory(CATEGORIES.DAIRY, 1, recentlyUsedIds);
      selectedItems.push(...dairy);
    }
    
    const recipe = new Recipe(mealType, new Date().toISOString(), selectedItems);
    return recipe;
  }

  selectFromCategory(category, count, excludeIds = []) {
    const availableItems = this.inventory.getAvailableItems(category);
    
    if (availableItems.length === 0) {
      return [];
    }
    
    const scoredItems = availableItems.map(item => ({
      item: item,
      score: this.calculateItemScore(item, excludeIds)
    }));
    
    scoredItems.sort((a, b) => b.score - a.score);
    
    const selected = [];
    const selectedIds = new Set();
    
    for (let i = 0; i < scoredItems.length && selected.length < count; i++) {
      const item = scoredItems[i].item;
      if (!selectedIds.has(item.id)) {
        selected.push(item);
        selectedIds.add(item.id);
      }
    }
    
    while (selected.length < count && availableItems.length > 0) {
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      selected.push(randomItem);
    }
    
    return selected;
  }

  calculateItemScore(foodItem, recentlyUsedIds) {
    let score = 100;
    
    if (recentlyUsedIds.includes(foodItem.id)) {
      score -= 50;
    }
    
    score += Math.random() * 10;
    
    return score;
  }
}
