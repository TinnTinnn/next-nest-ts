export enum Department {
  Production = 'Production',
  Marketing = 'Marketing',
  Maintenance = 'Maintenance',
  QualityControl = 'QualityControl',
  Logistics = 'Logistics',
  Accounting = 'Accounting',
  HumanResources = 'HumanResources',
}

export const DepartmentLabels: Record<Department, string> = {
  [Department.Production]: 'Production',
  [Department.Marketing]: 'Marketing',
  [Department.Maintenance]: 'Maintenance',
  [Department.QualityControl]: 'Quality',
  [Department.Logistics]: 'Logistics',
  [Department.Accounting]: 'Accounting',
  [Department.HumanResources]: 'Human Resources',
}

export const DepartmentOptions = Object.entries(DepartmentLabels).map(([value, label]) => ({
  value: value as Department,
  label
}))
