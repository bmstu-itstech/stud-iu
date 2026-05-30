import type { AxiosResponse } from "axios";
import apiClient from "./axios";
import type { News, PaginatedResponse } from "./types";

const BASE_URL = "/news";

interface ListParams {
  limit?: number;
  offset?: number;
}

export const getNews = (
  params?: ListParams,
): Promise<AxiosResponse<PaginatedResponse<News>>> => {
  return apiClient.get(BASE_URL + "/", { params });
};

export const getNewsById = (id: number): Promise<AxiosResponse<News>> => {
  return apiClient.get(`${BASE_URL}/${id}/`);
};

export const createNews = (data: unknown) => {
  return apiClient.post(BASE_URL + "/", data);
};

export const updateNews = (id: number, data: unknown) => {
  return apiClient.put(`${BASE_URL}/${id}/`, data);
};

export const deleteNews = (id: number) => {
  return apiClient.delete(`${BASE_URL}/${id}/`);
};
