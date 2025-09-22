export interface Response {
  _id: string
  formId: string
  userId: string
  response: any // Dynamic response data
  submittedAt: string
}

export interface CreateResponseData {
  formId: string
  userId: string
  response: any
}
