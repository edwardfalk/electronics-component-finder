import axios from 'axios'
import type { Component, ComponentFilters } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const searchComponents = async (
  searchTerm: string,
  filters?: ComponentFilters
): Promise<Component[]> => {
  const { data } = await api.get('/components', {
    params: {
      searchTerm,
      ...filters,
    },
  })
  return data
}

export const getComponent = async (id: string): Promise<Component> => {
  const { data } = await api.get(`/components/${id}`)
  return data
}

export const getComponentCategories = async (): Promise<string[]> => {
  const { data } = await api.get('/components/categories')
  return data
}

export const getComponentShops = async (): Promise<string[]> => {
  const { data } = await api.get('/components/shops')
  return data
}

export const addComponentToList = async (
  componentId: string,
  listId: string,
  quantity: number = 1
): Promise<void> => {
  await api.post(`/components/${componentId}/lists/${listId}`, { quantity })
}

export const removeComponentFromList = async (
  componentId: string,
  listId: string
): Promise<void> => {
  await api.delete(`/components/${componentId}/lists/${listId}`)
} 