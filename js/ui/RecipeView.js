class RecipeView {
  constructor(container, recipeGenerator, historyService) {
    this.container = container;
    this.recipeGenerator = recipeGenerator;
    this.historyService = historyService;
    this.currentRecipe = null;
  }

  render() {
    const today = new Date();
    const dateStr = this.formatDate(today);
    
    this.container.innerHTML = `
      <div class="recipe-view">
        <div style="background-color: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 16px; text-align: center;">
          <span style="font-size: 16px; color: #2e7d32; font-weight: 600;">📅 ${dateStr}</span>
        </div>
        
        <h2 style="margin-bottom: 16px; font-size: 18px;">食事を選択してください</h2>
        
        <div class="meal-type-buttons" style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px;">
          <button class="btn btn-primary" data-meal-type="${MEAL_TYPES.BREAKFAST}" style="flex: 1; min-width: 120px;">
            🌅 ${MEAL_TYPES.BREAKFAST}
          </button>
          <button class="btn btn-primary" data-meal-type="${MEAL_TYPES.LUNCH}" style="flex: 1; min-width: 120px;">
            ☀️ ${MEAL_TYPES.LUNCH}
          </button>
          <button class="btn btn-primary" data-meal-type="${MEAL_TYPES.DINNER}" style="flex: 1; min-width: 120px;">
            🌙 ${MEAL_TYPES.DINNER}
          </button>
        </div>
        
        <div id="recipe-result"></div>
      </div>
    `;

    this.attachEventListeners();
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日 (${weekday})`;
  }

  attachEventListeners() {
    const buttons = this.container.querySelectorAll('[data-meal-type]');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const mealType = e.target.getAttribute('data-meal-type');
        this.onMealTypeSelected(mealType);
      });
    });
  }

  onMealTypeSelected(mealType) {
    try {
      const existingRecipe = this.historyService.getTodayRecipe(mealType);
      
      if (existingRecipe) {
        this.currentRecipe = existingRecipe;
        this.displayRecipe(existingRecipe, true, mealType);
      } else {
        const recipe = this.recipeGenerator.generateRecipe(mealType);
        this.currentRecipe = recipe;
        this.displayRecipe(recipe, false, mealType);
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  saveRecipe() {
    if (this.currentRecipe) {
      this.historyService.addRecipe(this.currentRecipe);
      this.displayRecipe(this.currentRecipe, true, this.currentRecipe.mealType);
    }
  }

  regenerateRecipe(mealType) {
    try {
      const recipe = this.recipeGenerator.generateRecipe(mealType);
      this.currentRecipe = recipe;
      this.displayRecipe(recipe, false, mealType);
    } catch (error) {
      this.showError(error.message);
    }
  }

  displayRecipe(recipe, isExisting = false, mealType = null) {
    const resultDiv = this.container.querySelector('#recipe-result');
    
    const categoryGroups = {};
    recipe.foodItems.forEach(item => {
      if (!categoryGroups[item.category]) {
        categoryGroups[item.category] = [];
      }
      categoryGroups[item.category].push(item);
    });

    const statusBadge = isExisting 
      ? '<span style="background-color: #FFC107; color: #333; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">保存済み</span>'
      : '<span style="background-color: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">未保存</span>';

    let html = `
      <div style="background-color: #f9f9f9; border-radius: 12px; padding: 16px; border: 2px solid #4CAF50;">
        <h3 style="margin-bottom: 12px; color: #4CAF50; font-size: 16px; display: flex; align-items: center; flex-wrap: wrap;">
          <span>📋 ${recipe.mealType}のレシピ</span>
          ${statusBadge}
        </h3>
        <div style="background-color: white; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
    `;

    Object.entries(categoryGroups).forEach(([category, items]) => {
      html += `<div style="margin-bottom: 8px;">`;
      html += `<strong style="color: #666; font-size: 14px;">${category}:</strong> `;
      html += items.map(item => item.name).join('、');
      html += `</div>`;
    });

    html += `</div>`;

    // ボタンを追加
    if (isExisting) {
      html += `
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" id="regenerate-btn" style="flex: 1;">
            🔄 別のレシピを生成
          </button>
        </div>
      `;
    } else {
      html += `
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" id="save-recipe-btn" style="flex: 1;">
            💾 このレシピを保存
          </button>
          <button class="btn btn-outline" id="regenerate-btn" style="flex: 1;">
            🔄 再生成
          </button>
        </div>
      `;
    }

    html += `</div>`;

    resultDiv.innerHTML = html;

    // イベントリスナーを追加
    const saveBtn = resultDiv.querySelector('#save-recipe-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveRecipe());
    }

    const regenerateBtn = resultDiv.querySelector('#regenerate-btn');
    if (regenerateBtn && mealType) {
      regenerateBtn.addEventListener('click', () => this.regenerateRecipe(mealType));
    }
  }

  showError(message) {
    const resultDiv = this.container.querySelector('#recipe-result');
    resultDiv.innerHTML = `
      <div class="error-message">
        ⚠️ ${message}
      </div>
    `;
  }
}
