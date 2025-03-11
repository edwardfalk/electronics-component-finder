import axios from 'axios'
import type { PartsList } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getPartsLists = async (): Promise<PartsList[]> => {
  const { data } = await api.get('/parts-lists')
  return data
}

export const getPartsList = async (id: string): Promise<PartsList> => {
  const { data } = await api.get(`/parts-lists/${id}`)
  return data
}

export const createPartsList = async (params: { name: string }): Promise<PartsList> => {
  const { data } = await api.post('/parts-lists', params)
  return data
}

export const updatePartsList = async (id: string, params: { name: string }): Promise<PartsList> => {
  const { data } = await api.put(`/parts-lists/${id}`, params)
  return data
}

export const deletePartsList = async (id: string): Promise<void> => {
  await api.delete(`/parts-lists/${id}`)
} 