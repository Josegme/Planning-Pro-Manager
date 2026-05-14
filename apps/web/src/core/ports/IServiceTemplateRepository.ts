import type { ServiceTemplate } from '../domain/serviceTemplate/ServiceTemplate'

export interface CreateServiceTemplateData {
  name: string
  category: string
  description?: string | null
  isRequired?: boolean
  displayOrder?: number
}

export interface UpdateServiceTemplateData {
  name?: string
  category?: string
  description?: string | null
  isRequired?: boolean
  displayOrder?: number
}

export interface IServiceTemplateRepository {
  findByOrg(): Promise<ServiceTemplate[]>
  create(data: CreateServiceTemplateData): Promise<ServiceTemplate>
  update(id: string, data: UpdateServiceTemplateData): Promise<ServiceTemplate>
  delete(id: string): Promise<void>
}
