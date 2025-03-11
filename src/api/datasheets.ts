import axios from 'axios'
import type { Datasheet } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const searchDatasheets = async (searchTerm: string): Promise<Datasheet[]> => {
  const { data } = await api.get('/datasheets', { params: { searchTerm } })
  return data
}

export const getDatasheet = async (id: string): Promise<Datasheet> => {
  const { data } = await api.get(`/datasheets/${id}`)
  return data
}

export const downloadDatasheet = async (id: string): Promise<string> => {
  const { data } = await api.get(`/datasheets/${id}/download`)
  return data.url
}

export const uploadDatasheet = async (file: File, metadata: {
  componentName: string
  manufacturer: string
  partNumber: string
}): Promise<Datasheet> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('metadata', JSON.stringify(metadata))

  const { data } = await api.post('/datasheets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
} 