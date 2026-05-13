import { devClient } from './client'

// Standard CRM Events — used as hackathon contest records
// Admin (developer JWT) for create/update/delete; API key for reads

export const listEvents = (params = {}) =>
  devClient.get('/api/v1/standard/events/', { params })

export const getEvent = (uuid) =>
  devClient.get(`/api/v1/standard/events/${uuid}/`)

export const createEvent = (data) =>
  devClient.post('/api/v1/standard/events/', data)

export const updateEvent = (uuid, data) =>
  devClient.patch(`/api/v1/standard/events/${uuid}/`, data)

export const deleteEvent = (uuid) =>
  devClient.delete(`/api/v1/standard/events/${uuid}/`)
