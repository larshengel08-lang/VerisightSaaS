import { retentionScanDefinition } from '@/lib/products/retention/definition'
import { buildRetentionDashboardViewModel } from '@/lib/products/retention/dashboard'
import {
  RETENTION_ACTION_PLAYBOOKS,
  RETENTION_ACTION_PLAYBOOK_CALIBRATION_NOTE,
} from '@/lib/products/retention/action-playbooks'
import { RETENTION_FOCUS_QUESTIONS } from '@/lib/products/retention/focus-questions'
import type { ProductModule } from '@/lib/products/shared/types'

export const retentionProductModule: ProductModule = {
  scanType: 'retention',
  definition: retentionScanDefinition,
  buildDashboardViewModel: (args) =>
    buildRetentionDashboardViewModel(args),
  getFocusQuestions: () => RETENTION_FOCUS_QUESTIONS,
  getActionPlaybooks: () => RETENTION_ACTION_PLAYBOOKS,
  getActionPlaybookCalibrationNote: () => RETENTION_ACTION_PLAYBOOK_CALIBRATION_NOTE,
}
