export interface MtoDesignInput {
  source: 'mto'
  themes: string[]
  notes: string | null
}

export interface MtoDesignInputSummary {
  source: 'mto'
  mode: 'design_input_only'
  themeCount: number
  notes: string | null
  canCreateAssignments: false
  canOpenCarrier: false
}

export function describeMtoDesignInput(input: MtoDesignInput): MtoDesignInputSummary {
  return {
    source: input.source,
    mode: 'design_input_only',
    themeCount: input.themes.length,
    notes: input.notes,
    canCreateAssignments: false,
    canOpenCarrier: false,
  }
}
