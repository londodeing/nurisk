import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    auth: 'src/auth/index.ts',
    incident: 'src/incident/index.ts',
    volunteer: 'src/volunteer/index.ts',
    assessment: 'src/assessment/index.ts',
    shelter: 'src/shelter/index.ts',
    warehouse: 'src/warehouse/index.ts',
    chat: 'src/chat/index.ts',
    notification: 'src/notification/index.ts',
    inventory: 'src/inventory/index.ts',
    logistics: 'src/logistics/index.ts',
    mission: 'src/mission/index.ts',
    common: 'src/common/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
})