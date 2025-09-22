export interface Form {
  _id: string
  title: string
  description: string
  schema: any // SurveyJS JSON schema
  createdBy: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface CreateFormData {
  title: string
  description: string
  schema: any
}

export interface UpdateFormData {
  title?: string
  description?: string
  schema?: any
}
