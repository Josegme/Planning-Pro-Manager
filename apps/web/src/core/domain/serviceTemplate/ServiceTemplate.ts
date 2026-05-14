export interface ServiceTemplate {
  id: string
  orgId: string
  name: string
  category: string
  description: string | null
  isRequired: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}
