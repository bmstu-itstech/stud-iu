import type { AxiosResponse } from "axios";
import apiClient from "./axios";
import type { FutureEvent, PastEvent, PaginatedResponse } from "./types";

interface ListParams {
  limit?: number;
  offset?: number;
}

const FUTURE_BASE_URL = "/events/future_events";
const EVENTS_BASE_URL = "/events";

export const getFutureEvents = (
  params?: ListParams,
): Promise<AxiosResponse<PaginatedResponse<FutureEvent>>> => {
  return apiClient.get(FUTURE_BASE_URL + "/", { params });
};

export const getFutureEventById = (
  id: number,
): Promise<AxiosResponse<FutureEvent>> => {
  return apiClient.get(`${EVENTS_BASE_URL}/${id}`);
};

export const createFutureEvent = (data: unknown) => {
  return apiClient.post(FUTURE_BASE_URL + "/", data);
};

export const updateFutureEvent = (id: number, data: unknown) => {
  return apiClient.put(`${EVENTS_BASE_URL}/${id}`, data);
};

export const deleteFutureEvent = (id: number) => {
  return apiClient.delete(`${EVENTS_BASE_URL}/${id}`);
};

const PAST_BASE_URL = "/events/past_events";

export const getPastEvents = (
  params?: ListParams,
): Promise<AxiosResponse<PaginatedResponse<PastEvent>>> => {
  return apiClient.get(PAST_BASE_URL + "/", { params });
};

export const getPastEventById = (
  id: number,
): Promise<AxiosResponse<PastEvent>> => {
  return apiClient.get(`${EVENTS_BASE_URL}/${id}`);
};

export const createPastEvent = (data: unknown) => {
  return apiClient.post(PAST_BASE_URL + "/", data);
};

export const updatePastEvent = (id: number, data: unknown) => {
  return apiClient.put(`${PAST_BASE_URL}/${id}/`, data);
};

export const deletePastEvent = (id: number) => {
  return apiClient.delete(`${PAST_BASE_URL}/${id}/`);
};

export const createEvent = (formData: FormData) => {
  return apiClient.post(EVENTS_BASE_URL, formData);
};
