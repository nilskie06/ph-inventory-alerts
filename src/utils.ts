import { InventoryItem, AlertSeverity, AlertType } from './types';

/**
 * Calculate reorder quantity based on usage patterns
 */
export function calculateReorderQuantity(
  currentStock: number,
  minStock: number,
  maxStock: number,
  averageDailyUsage: number,
  leadTimeDays: number
): number {
  const safetyStock = minStock * 1.5;
  const reorderPoint = minStock + (averageDailyUsage * leadTimeDays);
  const targetStock = maxStock || minStock * 3;
  
  return Math.max(0, Math.ceil(targetStock - currentStock + safetyStock));
}

/**
 * Calculate stock turnover rate
 */
export function calculateTurnoverRate(
  unitsSold: number,
  averageInventory: number,
  periodDays: number
): number {
  if (averageInventory === 0) return 0;
  return (unitsSold / averageInventory) * (365 / periodDays);
}

/**
 * Calculate days of stock remaining
 */
export function calculateDaysOfStock(
  currentQuantity: number,
  averageDailyUsage: number
): number {
  if (averageDailyUsage === 0) return Infinity;
  return Math.floor(currentQuantity / averageDailyUsage);
}

/**
 * Generate SKU from product info
 */
export function generateSku(
  category: string,
  productName: string,
  variant?: string
): string {
  const catCode = category.substring(0, 3).toUpperCase();
  const nameCode = productName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 5)
    .toUpperCase();
  const variantCode = variant
    ? variant.substring(0, 2).toUpperCase()
    : '00';
  
  return `${catCode}-${nameCode}-${variantCode}`;
}

/**
 * Validate inventory item
 */
export function validateItem(item: Partial<InventoryItem>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!item.id) errors.push('ID is required');
  if (!item.name) errors.push('Name is required');
  if (!item.sku) errors.push('SKU is required');
  if (item.quantity === undefined || item.quantity < 0) {
    errors.push('Quantity must be >= 0');
  }
  if (item.minQuantity === undefined || item.minQuantity < 0) {
    errors.push('Minimum quantity must be >= 0');
  }
  if (item.maxQuantity !== undefined && item.maxQuantity < item.minQuantity!) {
    errors.push('Maximum quantity must be >= minimum quantity');
  }
  if (!item.unit) errors.push('Unit is required');

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format alert for display
 */
export function formatAlert(alert: {
  severity: AlertSeverity;
  type: AlertType;
  itemName: string;
  sku: string;
  message: string;
  quantity: number;
}): string {
  const icons: Record<AlertSeverity, string> = {
    [AlertSeverity.LOW]: 'ℹ️',
    [AlertSeverity.MEDIUM]: '⚠️',
    [AlertSeverity.HIGH]: '🔶',
    [AlertSeverity.CRITICAL]: '🚨'
  };

  return `${icons[alert.severity]} [${alert.severity.toUpperCase()}] ${alert.message}`;
}

/**
 * Sort items by stock level (lowest first)
 */
export function sortByStockLevel(items: InventoryItem[]): InventoryItem[] {
  return [...items].sort((a, b) => {
    const aRatio = a.quantity / (a.minQuantity || 1);
    const bRatio = b.quantity / (b.minQuantity || 1);
    return aRatio - bRatio;
  });
}

/**
 * Group items by category
 */
export function groupByCategory(items: InventoryItem[]): Map<string, InventoryItem[]> {
  const groups = new Map<string, InventoryItem[]>();
  
  for (const item of items) {
    const category = item.category || 'Uncategorized';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(item);
  }
  
  return groups;
}
