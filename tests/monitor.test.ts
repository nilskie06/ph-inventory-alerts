import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryMonitor } from '../src/monitor';
import {
  InventoryItem,
  AlertSeverity,
  AlertType
} from '../src/types';
import {
  calculateReorderQuantity,
  calculateTurnoverRate,
  calculateDaysOfStock,
  generateSku,
  validateItem
} from '../src/utils';

describe('InventoryMonitor', () => {
  let monitor: InventoryMonitor;

  const sampleItem: InventoryItem = {
    id: 'item-001',
    name: 'Widget A',
    sku: 'WDG-A-001',
    quantity: 50,
    minQuantity: 10,
    maxQuantity: 100,
    unit: 'pcs',
    category: 'Widgets',
    location: 'Warehouse A',
    lastUpdated: new Date()
  };

  beforeEach(() => {
    monitor = new InventoryMonitor();
    monitor.addItem(sampleItem);
  });

  it('should add and retrieve items', () => {
    const item = monitor.getItem('item-001');
    expect(item).toBeDefined();
    expect(item?.name).toBe('Widget A');
  });

  it('should update quantity', () => {
    monitor.updateQuantity('item-001', 25);
    const item = monitor.getItem('item-001');
    expect(item?.quantity).toBe(25);
  });

  it('should check stock levels correctly', () => {
    const result = monitor.checkStock(sampleItem);
    expect(result.isLow).toBe(false);
    expect(result.isOut).toBe(false);
    expect(result.isOverstock).toBe(false);
  });

  it('should detect low stock', () => {
    const lowStockItem: InventoryItem = {
      ...sampleItem,
      id: 'item-002',
      quantity: 5
    };
    monitor.addItem(lowStockItem);

    const result = monitor.checkStock(lowStockItem);
    expect(result.isLow).toBe(true);
    expect(result.needsReorder).toBe(true);
  });

  it('should detect out of stock', () => {
    const outOfStockItem: InventoryItem = {
      ...sampleItem,
      id: 'item-003',
      quantity: 0
    };
    monitor.addItem(outOfStockItem);

    const result = monitor.checkStock(outOfStockItem);
    expect(result.isOut).toBe(true);
    expect(result.isLow).toBe(true);
  });

  it('should generate alerts on checkAllStock', () => {
    const lowItem: InventoryItem = {
      ...sampleItem,
      id: 'low-item',
      quantity: 3
    };
    monitor.addItem(lowItem);

    monitor.checkAllStock();
    const alerts = monitor.getActiveAlerts();
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('should acknowledge alerts', () => {
    monitor.checkAllStock();
    const alerts = monitor.getActiveAlerts();
    
    if (alerts.length > 0) {
      const acknowledged = monitor.acknowledgeAlert(alerts[0].id);
      expect(acknowledged).toBe(true);
      expect(monitor.getActiveAlerts().length).toBe(0);
    }
  });

  it('should filter items by category', () => {
    const categoryItem: InventoryItem = {
      ...sampleItem,
      id: 'cat-item',
      category: 'Electronics'
    };
    monitor.addItem(categoryItem);

    const electronics = monitor.getItemsByCategory('Electronics');
    expect(electronics.length).toBe(1);
    expect(electronics[0].id).toBe('cat-item');
  });

  it('should return inventory summary', () => {
    const summary = monitor.getInventorySummary();
    expect(summary.totalItems).toBe(1);
    expect(summary.totalQuantity).toBe(50);
    expect(summary.categories).toContain('Widgets');
  });

  it('should register and trigger alert callbacks', () => {
    let alertReceived = false;
    let receivedAlerts: any[] = [];

    monitor.onAlert((alert) => {
      alertReceived = true;
      receivedAlerts.push(alert);
    });

    const outOfStockItem: InventoryItem = {
      ...sampleItem,
      id: 'callback-item',
      quantity: 0
    };
    monitor.addItem(outOfStockItem);
    monitor.checkAllStock();

    expect(alertReceived).toBe(true);
    expect(receivedAlerts.length).toBeGreaterThan(0);
    const outOfStockAlert = receivedAlerts.find(a => a.type === AlertType.OUT_OF_STOCK);
    expect(outOfStockAlert).toBeDefined();
  });
});

describe('Utility Functions', () => {
  it('should calculate reorder quantity', () => {
    const qty = calculateReorderQuantity(20, 10, 100, 5, 7);
    expect(qty).toBeGreaterThan(0);
  });

  it('should calculate turnover rate', () => {
    const rate = calculateTurnoverRate(1000, 200, 30);
    expect(rate).toBeGreaterThan(0);
  });

  it('should calculate days of stock', () => {
    const days = calculateDaysOfStock(100, 10);
    expect(days).toBe(10);
  });

  it('should handle infinite days when no usage', () => {
    const days = calculateDaysOfStock(100, 0);
    expect(days).toBe(Infinity);
  });

  it('should generate SKU', () => {
    const sku = generateSku('Electronics', 'Widget Pro', 'XL');
    expect(sku).toMatch(/^ELE-WIDGE-XL$/);
  });

  it('should validate valid item', () => {
    const result = validateItem({
      id: 'test',
      name: 'Test Item',
      sku: 'TST-001',
      quantity: 10,
      minQuantity: 5,
      unit: 'pcs'
    });
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should reject invalid item', () => {
    const result = validateItem({
      quantity: -1
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
