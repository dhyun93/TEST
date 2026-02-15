export type CauseImporterRow = {
  id: number
  category: string
  situation: string
  hazard: string
}

export type NearMissImporterRow = {
  id: number
  process: string
  hazard: string
  action: string
}

export type EvaluationData = {
  id: number
  year: number
  title: string
  type: string
  method: string
  regulation: string
  registered: string
  modified: string
  completed: string
  status: { text: string; color: string }
}

export type FrequencyStep1Row = {
  id: number
  work: string
  hazard: string
  law: string
  action: string
  proof?: File | null
}

export type FrequencyRiskDataRow = {
  id: number
  work: string
  hazard: string
  action: string
  attachmentFile: string | null
  frequency: number
  intensity: number
  afterPhoto: string | null
  evaluator: string
  evaluationDate: Date
}

export type FrequencyStep3Row = {
  id: number
  work: string
  hazard: string
  action: string
  plannedDate: Date
  completedDate: Date
  evaluator: string
  frequency: number
  intensity: number
  afterPhoto: string | null
}

export type ThreeStep1Row = {
  id: number
  work: string
  hazard: string
  law: string
  action: string
  proof?: File | null
}

export type ThreeStepRiskDataRow = {
  id: number
  work: string
  hazard: string
  action: string
  attachmentFile: string | null
  afterPhoto: string | null
  evaluator: string
  evaluationDate: Date
  riskLevel: number
}

export type ThreeStep3Row = {
  id: number
  work: string
  hazard: string
  action: string
  plannedDate: Date
  completedDate: Date
  evaluator: string
  riskLevel: number
  afterPhoto: string | null
}

export type ChemicalEditableRow = {
  id: number
  process: string
  product: string
  substance: string
  exposure: string
  toxicity: string
  risk: number
  action: string
  image?: File | null
}

export type ChecklistSection = {
  title: string
  items?: string[]
  type?: "table" | "form"
  className?: string
  downloadKey?: string
}

export type ProcessRow = {
  id: number
  process: string
  description: string
}

export type ChecklistStep1Row = {
  id: number
  category: string
  hazard: string
  safetyMeasure: string
  checkResult: string
  note: string
}