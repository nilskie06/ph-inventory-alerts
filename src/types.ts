/**
 * Inventory item interface
 */
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  unit: string;
  category?: string;
  location?: string;
  lastUpdated: Date;
}

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Alert types
 */
export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCK = 'overstock',
  REORDER = 'reorder',
  EXPIRY = 'expiry'
}

/**
 * Inventory alert
 */
export interface InventoryAlert {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  quantity: number;
  threshold: number;
  createdAt: Date;
  acknowledged: boolean;
}

/**
 * Alert callback function type
 */
export type AlertCallback = (alert: InventoryAlert) => void;

/**
 * Stock level check result
 */
export interface StockCheckResult {
  item: InventoryItem;
  isLow: boolean;
  isOut: boolean;
  isOverstock: boolean;
  needsReorder: boolean;
  recommendedOrder: number;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  lowStockThreshold?: number;
  criticalStockThreshold?: number;
  overstockMultiplier?: number;
  checkIntervalMs?: number;
}
