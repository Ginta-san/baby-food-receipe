class Recipe {
  constructor(mealType, date, foodItems) {
    this.mealType = mealType;
    this.date = date;
    this.foodItems = foodItems;
  }

  getCategorySummary() {
    const summary = {};
    this.foodItems.forEach(item => {
      if (!summary[item.category]) {
        summary[item.category] = 0;
      }
      summary[item.category]++;
    });
    return summary;
  }

  toJSON() {
    return {
      mealType: this.mealType,
      date: this.date,
      foodItems: this.foodItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category
      }))
    };
  }

  static fromJSON(json) {
    const foodItems = json.foodItems.map(item => 
      new FoodItem(item.id, item.name, item.category, false, false)
    );
    return new Recipe(json.mealType, json.date, foodItems);
  }
}
