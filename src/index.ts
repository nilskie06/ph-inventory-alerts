/**
 * ph-inventory-alerts
 * 
 * Inventory stock level monitoring and alert system for warehouse management.
 * Track stock levels, get alerts for low/out-of-stock items, and manage
 * inventory efficiently.
 * 
 * @packageDocumentation
 */

// Main classes
export { InventoryMonitor } from './monitor';

// Types
export {
  InventoryItem,
  InventoryAlert,
  AlertType,
  AlertSeverity,
  AlertCallback,
  StockCheckResult,
  AlertConfig
} from './types';

// Utility functions
export {
  calculateReorderQuantity,
  calculateTurnoverRate,
  calculateDaysOfStock,
  generateSku,
  validateItem,
  formatAlert,
  sortByStockLevel,
  groupByCategory
} from './utils';
