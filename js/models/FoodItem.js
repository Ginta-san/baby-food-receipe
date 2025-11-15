class FoodItem {
  constructor(id, name, category, isAvailable = false, isCustom = false) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.isAvailable = isAvailable;
    this.isCustom = isCustom;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      isAvailable: this.isAvailable,
      isCustom: this.isCustom
    };
  }

  static fromJSON(json) {
    return new FoodItem(
      json.id,
      json.name,
      json.category,
      json.isAvailable,
      json.isCustom
    );
  }
}
