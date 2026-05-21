export const ASSET_TYPE = [
  'equipment',
  'vehicle',
  'supply',
  'facility',
  'personnel'
] as const;

export const TRANSACTION_TYPE = [
  'allocation',
  'transfer',
  'consumption',
  'maintenance',
  'disposal'
] as const;

export const CONDITION = [
  'new',
  'good',
  'fair',
  'poor',
  'broken'
] as const;