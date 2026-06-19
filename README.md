# ph-inventory-alerts

Inventory stock level monitoring and alert system for warehouse management. Track stock levels, get alerts for low/out-of-stock items, and manage inventory efficiently.

## Installation

```bash
npm install ph-inventory-alerts
```

## Quick Start

```typescript
import { InventoryMonitor, InventoryItem, AlertSeverity } from 'ph-inventory-alerts';

// Create a monitor
const monitor = new InventoryMonitor({
  lowStockThreshold: 10,
  criticalStockThreshold: 5
});

// Add inventory items
monitor.addItem({
  id: 'item-001',
  name: 'Widget A',
  sku: 'WDG-A-001',
  quantity: 50,
  minQuantity: 10,
  maxQuantity: 100,
  unit: 'pcs',
  category: 'Widgets',
  lastUpdated: new Date()
});

// Register alert handler
monitor.onAlert((alert) => {
  console.log(`[${alert.severity}] ${alert.message}`);
});

// Check stock levels
const results = monitor.checkAllStock();
console.log(`Checked ${results.length} items`);

// Get alerts
const lowStockAlerts = monitor.getAlertsBySeverity(AlertSeverity.HIGH);
```

## Features

### Stock Level Monitoring
- Track inventory items with quantities, min/max thresholds
- Real-time stock level checking
- Automatic alert generation

### Alert System
- Multiple severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- Alert types: LOW_STOCK, OUT_OF_STOCK, OVERSTOCK, REORDER
- Callback system for custom alert handling
- Alert acknowledgment

### Utility Functions
- `calculateReorderQuantity()` - Determine optimal reorder amounts
- `calculateTurnoverRate()` - Measure inventory efficiency
- `calculateDaysOfStock()` - Estimate stock duration
- `generateSku()` - Create SKU codes automatically
- `validateItem()` - Validate inventory item data
- `sortByStockLevel()` - Sort items by urgency
- `groupByCategory()` - Organize items by category

## Configuration

```typescript
const monitor = new InventoryMonitor({
  lowStockThreshold: 10,        // Default: 10
  criticalStockThreshold: 5,    // Default: 5
  overstockMultiplier: 2,       // Default: 2
  checkIntervalMs: 60000        // Default: 60000 (1 minute)
});
```

## API Reference

### InventoryMonitor

#### `addItem(item: InventoryItem): void`
Add or update an inventory item.

#### `removeItem(id: string): boolean`
Remove an item by ID.

#### `getItem(id: string): InventoryItem | undefined`
Retrieve an item by ID.

#### `getAllItems(): InventoryItem[]`
Get all inventory items.

#### `updateQuantity(id: string, quantity: number): InventoryItem | undefined`
Update item quantity.

#### `onAlert(callback: AlertCallback): void`
Register an alert callback function.

#### `checkStock(item: InventoryItem): StockCheckResult`
Check stock level for a single item.

#### `checkAllStock(): StockCheckResult[]`
Check all items and generate alerts.

#### `getActiveAlerts(): InventoryAlert[]`
Get all unacknowledged alerts.

#### `getAlertsBySeverity(severity: AlertSeverity): InventoryAlert[]`
Filter alerts by severity level.

#### `acknowledgeAlert(alertId: string): boolean`
Mark an alert as acknowledged.

#### `getLowStockItems(): InventoryItem[]`
Get items below minimum quantity.

#### `getOutOfStockItems(): InventoryItem[]`
Get items with zero quantity.

#### `getItemsByCategory(category: string): InventoryItem[]`
Filter items by category.

#### `getInventorySummary()`
Get summary statistics of inventory.

## Use Cases

- **Warehouse Management**: Track stock levels across warehouses
- **Retail Inventory**: Monitor product availability
- **Supply Chain**: Identify reorder needs
- **Manufacturing**: Track raw materials and components
- **E-commerce**: Prevent stockouts on popular items

## License

MIT © nilskie06
