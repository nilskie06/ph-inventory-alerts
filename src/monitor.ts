import {
  InventoryItem,
  InventoryAlert,
  AlertType,
  AlertSeverity,
  AlertCallback,
  StockCheckResult,
  AlertConfig
} from './types';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Inventory Monitor - Tracks stock levels and generates alerts
 */
export class InventoryMonitor {
  private items: Map<string, InventoryItem> = new Map();
  private alerts: InventoryAlert[] = [];
  private callbacks: AlertCallback[] = [];
  private config: Required<AlertConfig>;

  constructor(config: AlertConfig = {}) {
    this.config = {
      lowStockThreshold: config.lowStockThreshold ?? 10,
      criticalStockThreshold: config.criticalStockThreshold ?? 5,
      overstockMultiplier: config.overstockMultiplier ?? 2,
      checkIntervalMs: config.checkIntervalMs ?? 60000
    };
  }

  /**
   * Add or update an inventory item
   */
  addItem(item: InventoryItem): void {
    this.items.set(item.id, { ...item, lastUpdated: new Date() });
  }

  /**
   * Remove an inventory item
   */
  removeItem(id: string): boolean {
    return this.items.delete(id);
  }

  /**
   * Get an item by ID
   */
  getItem(id: string): InventoryItem | undefined {
    return this.items.get(id);
  }

  /**
   * Get all items
   */
  getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Update item quantity
   */
  updateQuantity(id: string, quantity: number): InventoryItem | undefined {
    const item = this.items.get(id);
    if (item) {
      item.quantity = quantity;
      item.lastUpdated = new Date();
      this.items.set(id, item);
    }
    return item;
  }

  /**
   * Register an alert callback
   */
  onAlert(callback: AlertCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Check stock level for a single item
   */
  checkStock(item: InventoryItem): StockCheckResult {
    const isOut = item.quantity === 0;
    const isLow = item.quantity <= item.minQuantity;
    const isOverstock = item.maxQuantity 
      ? item.quantity > item.maxQuantity * this.config.overstockMultiplier
      : false;
    const needsReorder = item.quantity <= item.minQuantity;

    const recommendedOrder = item.maxQuantity 
      ? item.maxQuantity - item.quantity
      : item.minQuantity * 2;

    return {
      item,
      isLow,
      isOut,
      isOverstock,
      needsReorder,
      recommendedOrder: Math.max(0, recommendedOrder)
    };
  }

  /**
   * Check all items and generate alerts
   */
  checkAllStock(): StockCheckResult[] {
    const results: StockCheckResult[] = [];

    for (const item of this.items.values()) {
      const result = this.checkStock(item);
      results.push(result);

      if (result.isOut) {
        this.createAlert(item, AlertType.OUT_OF_STOCK, AlertSeverity.CRITICAL,
          `OUT OF STOCK: ${item.name} (${item.sku}) has 0 units`);
      } else if (result.isLow) {
        const severity = item.quantity <= this.config.criticalStockThreshold
          ? AlertSeverity.HIGH
          : AlertSeverity.MEDIUM;
        this.createAlert(item, AlertType.LOW_STOCK, severity,
          `Low stock: ${item.name} (${item.sku}) has ${item.quantity} ${item.unit}`);
      } else if (result.isOverstock) {
        this.createAlert(item, AlertType.OVERSTOCK, AlertSeverity.LOW,
          `Overstock: ${item.name} (${item.sku}) has ${item.quantity} units`);
      }

      if (result.needsReorder) {
        this.createAlert(item, AlertType.REORDER, AlertSeverity.HIGH,
          `Reorder needed: ${item.name} - Order ${result.recommendedOrder} ${item.unit}`);
      }
    }

    return results;
  }

  /**
   * Create an alert
   */
  private createAlert(
    item: InventoryItem,
    type: AlertType,
    severity: AlertSeverity,
    message: string
  ): void {
    const alert: InventoryAlert = {
      id: generateId(),
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      type,
      severity,
      message,
      quantity: item.quantity,
      threshold: item.minQuantity,
      createdAt: new Date(),
      acknowledged: false
    };

    this.alerts.push(alert);
    this.notifyCallbacks(alert);
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(alert: InventoryAlert): void {
    for (const callback of this.callbacks) {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert callback error:', error);
      }
    }
  }

  /**
   * Get all unacknowledged alerts
   */
  getActiveAlerts(): InventoryAlert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): InventoryAlert[] {
    return this.alerts.filter(a => a.severity === severity && !a.acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Get low stock items
   */
  getLowStockItems(): InventoryItem[] {
    return this.getAllItems().filter(item => item.quantity <= item.minQuantity);
  }

  /**
   * Get out of stock items
   */
  getOutOfStockItems(): InventoryItem[] {
    return this.getAllItems().filter(item => item.quantity === 0);
  }

  /**
   * Get items by category
   */
  getItemsByCategory(category: string): InventoryItem[] {
    return this.getAllItems().filter(item => item.category === category);
  }

  /**
   * Get total inventory value (requires price per unit)
   */
  getInventorySummary(): {
    totalItems: number;
    totalQuantity: number;
    lowStockCount: number;
    outOfStockCount: number;
    categories: string[];
  } {
    const items = this.getAllItems();
    const categories = [...new Set(items.map(i => i.category).filter(Boolean))] as string[];

    return {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      lowStockCount: this.getLowStockItems().length,
      outOfStockCount: this.getOutOfStockItems().length,
      categories
    };
  }
}
