import type { Provider } from '../domain/provider/Provider'

export interface CreateProviderData {
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
}

export interface UpdateProviderData {
  name?: string
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
}

export interface IProviderRepository {
  findByOrg(): Promise<Provider[]>
  findById(id: string): Promise<Provider | null>
  create(data: CreateProviderData): Promise<Provider>
  update(id: string, data: UpdateProviderData): Promise<Provider>
  delete(id: string): Promise<void>
}
