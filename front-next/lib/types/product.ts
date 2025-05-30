export enum ProductCategory {
  MACHINE = 'MACHINE',
  INGREDIENT = 'INGREDIENT',
  FLAVORING = 'FLAVORING',
  PACKAGING = 'PACKAGING',
  UTENSIL = 'UTENSIL',
  INSTRUCTION = 'INSTRUCTION'
}

export enum ProductUnit {
  UNIT = 'UNIT',
  PIECE = 'PIECE',
  KILOGRAM = 'KILOGRAM',
  BOTTLE = 'BOTTLE',
  BOX = 'BOX',
  COPY = 'COPY',
  PACK = 'PACK'
}

export const ProductCategoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.MACHINE]: 'Machine',
  [ProductCategory.INGREDIENT]: 'Ingredient',
  [ProductCategory.FLAVORING]: 'Flavoring',
  [ProductCategory.PACKAGING]: 'Packaging',
  [ProductCategory.UTENSIL]: 'Utensil',
  [ProductCategory.INSTRUCTION]: 'Instruction'
}

export const ProductUnitLabels: Record<ProductUnit, string> = {
  [ProductUnit.UNIT]: 'Unit',
  [ProductUnit.PIECE]: 'Piece',
  [ProductUnit.KILOGRAM]: 'Kilogram',
  [ProductUnit.BOTTLE]: 'Bottle',
  [ProductUnit.BOX]: 'Box',
  [ProductUnit.COPY]: 'Copy',
  [ProductUnit.PACK]: 'Pack'
}

export const ProductCategoryOptions = Object.entries(ProductCategoryLabels).map(([value, label]) => ({
  value: value as ProductCategory,
  label
}))

export const ProductUnitOptions = Object.entries(ProductUnitLabels).map(([value, label]) => ({
  value: value as ProductUnit,
  label
}))
