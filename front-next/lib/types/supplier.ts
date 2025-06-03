export enum Supplier {
  CARPIGIANI = 'CARPIGIANI',
  TAYLOR = 'TAYLOR',
  BRAVO = 'BRAVO',
  NISSEI = 'NISSEI',
  ELECTROLUX = 'ELECTROLUX',
  GRAM = 'GRAM',
  TECNICHE = 'TECNICHE',
  ITALGEL = 'ITALGEL',
  PREGEL = 'PREGEL'
}

export const SupplierLabels: Record<Supplier, string> = {
  [Supplier.CARPIGIANI]: 'Carpigiani Group S.p.A.',
  [Supplier.TAYLOR]: 'Taylor Company',
  [Supplier.BRAVO]: 'Bravo S.p.A.',
  [Supplier.NISSEI]: 'Nissei Corporation',
  [Supplier.ELECTROLUX]: 'Electrolux Professional',
  [Supplier.GRAM]: 'Gram Equipment A/S',
  [Supplier.TECNICHE]: 'Tecnipesa S.p.A.',
  [Supplier.ITALGEL]: 'Italgel S.r.l.',
  [Supplier.PREGEL]: 'Pregel S.p.A.',
}

export const getSupplierDisplayName = (supplier: Supplier): string => {
  return SupplierLabels[supplier] || supplier
}

export const SupplierOptions = Object.entries(SupplierLabels).map(([value, label]) => ({
  value: value as Supplier,
  label
}))
