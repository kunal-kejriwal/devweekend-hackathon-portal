import { devClient, sdkClient, NS } from './client'

const BASE = `/api/v1/custom/${NS}/models/submission-reviews`

export const createReview = (data) =>
  sdkClient.post(`${BASE}/records/`, data)

export const listReviews = (params = {}) =>
  devClient.get(`${BASE}/view/records/`, { params })

export const getReview = (uuid) =>
  devClient.get(`${BASE}/records/${uuid}/`)

export const updateReview = (uuid, data) =>
  devClient.patch(`${BASE}/records/${uuid}/`, data)

export const deleteReview = (uuid) =>
  devClient.delete(`${BASE}/records/${uuid}/`)

// SDK read (reviewer sees their own reviews)
export const listReviewsSDK = (params = {}) =>
  sdkClient.get(`${BASE}/view/records/`, { params })
