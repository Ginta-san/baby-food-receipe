class StorageService {
  constructor() {
    this.INVENTORY_KEY = 'baby-food-inventory';
    this.HISTORY_KEY = 'baby-food-history';
  }

  saveInventory(inventory) {
    try {
      const data = JSON.stringify(inventory.toJSON());
      localStorage.setItem(this.INVENTORY_KEY, data);
      return true;
    } catch (error) {
      console.error('Failed to save inventory:', error);
      if (error.name === 'QuotaExceededError') {
        throw new Error('ストレージ容量が不足しています');
      }
      throw new Error('在庫データの保存に失敗しました');
    }
  }

  loadInventory() {
    try {
      const data = localStorage.getItem(this.INVENTORY_KEY);
      if (!data) {
        return Inventory.createDefault();
      }
      const json = JSON.parse(data);
      return Inventory.fromJSON(json);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      console.warn('Resetting to default inventory');
      return Inventory.createDefault();
    }
  }

  saveHistory(recipes) {
    try {
      const data = JSON.stringify({
        recipes: recipes.map(recipe => recipe.toJSON())
      });
      localStorage.setItem(this.HISTORY_KEY, data);
      return true;
    } catch (error) {
      console.error('Failed to save history:', error);
      if (error.name === 'QuotaExceededError') {
        this.clearOldHistory();
        try {
          const data = JSON.stringify({
            recipes: recipes.slice(-6).map(recipe => recipe.toJSON())
          });
          localStorage.setItem(this.HISTORY_KEY, data);
          return true;
        } catch (retryError) {
          throw new Error('ストレージ容量が不足しています');
        }
      }
      throw new Error('履歴データの保存に失敗しました');
    }
  }

  loadHistory() {
    try {
      const data = localStorage.getItem(this.HISTORY_KEY);
      if (!data) {
        return [];
      }
      const json = JSON.parse(data);
      return json.recipes.map(recipeData => Recipe.fromJSON(recipeData));
    } catch (error) {
      console.error('Failed to load history:', error);
      console.warn('Resetting history to empty');
      return [];
    }
  }

  clearOldHistory() {
    try {
      const recipes = this.loadHistory();
      const recentRecipes = recipes.slice(-6);
      this.saveHistory(recentRecipes);
    } catch (error) {
      console.error('Failed to clear old history:', error);
    }
  }

  clearAll() {
    try {
      localStorage.removeItem(this.INVENTORY_KEY);
      localStorage.removeItem(this.HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }
}
