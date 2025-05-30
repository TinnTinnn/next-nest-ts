export enum ProductCategory {
  Machine = 'Machine',
  Ingredient = 'Ingredient',
  Flavoring = 'Flavoring',
  Packaging = 'Packaging',
  Utensil = 'Utensil',
  Instruction = 'Instruction'
}

export enum ProductUnit {
  Unit = 'Unit',
  Piece = 'Piece',
  Kilogram = 'Kilogram',
  Bottle = 'Bottle',
  Box = 'Box',
  Copy = 'Copy',
  Pack = 'Pack'
}

export const ProductCategoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.Machine]: 'Machine',
  [ProductCategory.Ingredient]: 'Ingredient',
  [ProductCategory.Flavoring]: 'Flavoring',
  [ProductCategory.Packaging]: 'Packaging',
  [ProductCategory.Utensil]: 'Utensil',
  [ProductCategory.Instruction]: 'Instruction'
}

export const ProductUnitLabels: Record<ProductUnit, string> = {
  [ProductUnit.Unit]: 'Unit',
  [ProductUnit.Piece]: 'Piece',
  [ProductUnit.Kilogram]: 'Kilogram',
  [ProductUnit.Bottle]: 'Bottle',
  [ProductUnit.Box]: 'Box',
  [ProductUnit.Copy]: 'Copy',
  [ProductUnit.Pack]: 'Pack'
}

export const ProductCategoryOptions = Object.entries(ProductCategoryLabels).map(([value, label]) => ({
  value: value as ProductCategory,
  label
}))

export const ProductUnitOptions = Object.entries(ProductUnitLabels).map(([value, label]) => ({
  value: value as ProductUnit,
  label
}))
