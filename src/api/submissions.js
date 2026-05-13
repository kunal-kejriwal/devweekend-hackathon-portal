import { devClient, sdkClient, NS } from './client'

const BASE = `/api/v1/custom/${NS}/models/hackathon-submissions`

// Submitters create via SDK client; admins read all via dev client
export const createSubmission = (data) =>
  sdkClient.post(`${BASE}/records/`, data)

export const listSubmissions = (params = {}) =>
  devClient.get(`${BASE}/view/records/`, { params })

export const getSubmission = (uuid) =>
  devClient.get(`${BASE}/records/${uuid}/`)

export const updateSubmission = (uuid, data) =>
  devClient.patch(`${BASE}/records/${uuid}/`, data)

export const deleteSubmission = (uuid) =>
  devClient.delete(`${BASE}/records/${uuid}/`)

// SDK-authenticated read (for the submitter to view their own)
export const listSubmissionsSDK = (params = {}) =>
  sdkClient.get(`${BASE}/view/records/`, { params })
