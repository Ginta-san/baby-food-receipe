class HistoryService {
  constructor(storageService) {
    this.storageService = storageService;
    this.recipes = this.storageService.loadHistory();
    this.MAX_DAYS = 3;
    this.MAX_RECIPES = 9;
  }

  addRecipe(recipe) {
    const recipeDate = recipe.date.split('T')[0];
    
    // 同じ日の同じ食事タイプのレシピを削除（上書き）
    this.recipes = this.recipes.filter(r => {
      const existingDate = r.date.split('T')[0];
      return !(existingDate === recipeDate && r.mealType === recipe.mealType);
    });
    
    // 新しいレシピを追加
    this.recipes.push(recipe);
    
    // 日付でソート（新しい順）
    this.recipes.sort((a, b) => b.date.localeCompare(a.date));
    
    // 3日を超える古い日付のレシピを削除
    const uniqueDates = [...new Set(this.recipes.map(r => r.date.split('T')[0]))];
    if (uniqueDates.length > this.MAX_DAYS) {
      const sortedDates = uniqueDates.sort((a, b) => b.localeCompare(a));
      const datesToKeep = sortedDates.slice(0, this.MAX_DAYS);
      this.recipes = this.recipes.filter(r => {
        const date = r.date.split('T')[0];
        return datesToKeep.includes(date);
      });
    }
    
    this.storageService.saveHistory(this.recipes);
  }

  getRecipes(days = null) {
    if (days === null) {
      return [...this.recipes];
    }
    
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return this.recipes.filter(recipe => {
      const recipeDate = new Date(recipe.date);
      return recipeDate >= cutoffDate;
    });
  }

  getRecentlyUsedFoodIds(days = 2) {
    const recentRecipes = this.getRecipes(days);
    const foodIds = new Set();
    
    recentRecipes.forEach(recipe => {
      recipe.foodItems.forEach(item => {
        foodIds.add(item.id);
      });
    });
    
    return Array.from(foodIds);
  }

  getRecipesByDate() {
    const recipesByDate = new Map();
    
    this.recipes.forEach(recipe => {
      const dateKey = recipe.date.split('T')[0];
      if (!recipesByDate.has(dateKey)) {
        recipesByDate.set(dateKey, []);
      }
      recipesByDate.get(dateKey).push(recipe);
    });
    
    const sortedMap = new Map(
      [...recipesByDate.entries()].sort((a, b) => b[0].localeCompare(a[0]))
    );
    
    return sortedMap;
  }

  clear() {
    this.recipes = [];
    this.storageService.saveHistory(this.recipes);
  }

  getTodayRecipe(mealType) {
    const today = new Date().toISOString().split('T')[0];
    return this.recipes.find(recipe => {
      const recipeDate = recipe.date.split('T')[0];
      return recipeDate === today && recipe.mealType === mealType;
    });
  }

  hasTodayRecipe(mealType) {
    return this.getTodayRecipe(mealType) !== undefined;
  }
}
