export interface Response {
  _id: string
  formId: string
  userId: string
  response: Record<string, unknown> // Dynamic response data
  submittedAt: string
}

export interface CreateResponseData {
  formId: string
  userId: string
  response: Record<string, unknown>
}
