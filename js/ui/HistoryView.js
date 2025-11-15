class HistoryView {
  constructor(container, historyService) {
    this.container = container;
    this.historyService = historyService;
  }

  render() {
    const recipesByDate = this.historyService.getRecipesByDate();

    let html = `
      <div class="history-view">
        <h2 style="margin-bottom: 16px; font-size: 18px;">📅 履歴</h2>
    `;

    if (recipesByDate.size === 0) {
      html += `
        <div style="text-align: center; padding: 40px 20px; color: #999;">
          <p style="font-size: 16px;">まだレシピの履歴がありません</p>
          <p style="font-size: 14px; margin-top: 8px;">レシピ生成タブでレシピを作成してみましょう</p>
        </div>
      `;
    } else {
      recipesByDate.forEach((recipes, dateStr) => {
        const date = new Date(dateStr);
        const dateLabel = this.formatDate(date);

        html += `
          <div class="date-section" style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; color: #4CAF50; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e0e0e0;">
              ${dateLabel}
            </h3>
            <div class="recipes-grid" style="display: flex; flex-direction: column; gap: 12px;">
        `;

        const sortedRecipes = recipes.sort((a, b) => {
          const order = { '朝食': 1, '昼食': 2, '夕食': 3 };
          return order[a.mealType] - order[b.mealType];
        });

        sortedRecipes.forEach(recipe => {
          html += this.displayRecipeCard(recipe);
        });

        html += `
            </div>
          </div>
        `;
      });
    }

    html += `
      </div>
    `;

    this.container.innerHTML = html;
  }

  displayRecipeCard(recipe) {
    const mealIcon = {
      '朝食': '🌅',
      '昼食': '☀️',
      '夕食': '🌙'
    };

    const icon = mealIcon[recipe.mealType] || '🍽️';
    
    const foodList = recipe.foodItems.map(item => item.name).join('、');

    return `
      <div class="recipe-card" style="background-color: #f9f9f9; border-radius: 8px; padding: 12px; border-left: 4px solid #4CAF50;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 20px; margin-right: 8px;">${icon}</span>
          <strong style="font-size: 15px; color: #333;">${recipe.mealType}</strong>
        </div>
        <div style="font-size: 14px; color: #666; line-height: 1.5;">
          ${foodList}
        </div>
      </div>
    `;
  }

  formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateStr = date.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) {
      return '今日';
    } else if (dateStr === yesterdayStr) {
      return '昨日';
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const weekday = weekdays[date.getDay()];
      return `${month}月${day}日 (${weekday})`;
    }
  }
}
