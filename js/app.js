class App {
  constructor() {
    this.storageService = new StorageService();
    this.inventory = null;
    this.historyService = null;
    this.recipeGenerator = null;
    this.recipeView = null;
    this.inventoryView = null;
    this.historyView = null;
    this.currentTab = 'recipe';
  }

  async init() {
    try {
      this.registerServiceWorker();
      
      this.inventory = this.storageService.loadInventory();
      this.historyService = new HistoryService(this.storageService);
      this.recipeGenerator = new RecipeGenerator(this.inventory, this.historyService);
      
      const recipeContainer = document.getElementById('recipe-view');
      const inventoryContainer = document.getElementById('inventory-view');
      const historyContainer = document.getElementById('history-view');
      
      this.recipeView = new RecipeView(recipeContainer, this.recipeGenerator, this.historyService);
      this.inventoryView = new InventoryView(inventoryContainer, this.inventory, this.storageService);
      this.historyView = new HistoryView(historyContainer, this.historyService);
      
      this.recipeView.render();
      this.inventoryView.render();
      this.historyView.render();
      
      this.setupTabNavigation();
      
      this.setupErrorHandling();
      
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showInitError(error);
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(registration => {
            console.log('Service Worker registered:', registration);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }

  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        e.target.classList.add('active');
        document.getElementById(`${tabName}-view`).classList.add('active');
        
        this.currentTab = tabName;
        
        if (tabName === 'inventory') {
          this.inventoryView.render();
        } else if (tabName === 'history') {
          this.historyView.render();
        }
      });
    });
  }

  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  }

  showInitError(error) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #c62828; margin-bottom: 16px;">アプリの起動に失敗しました</h2>
        <p style="color: #666; margin-bottom: 16px;">${error.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">再読み込み</button>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
