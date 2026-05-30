import type { AxiosResponse } from "axios";
import apiClient from "./axios";
import type { Partner, PaginatedResponse } from "./types";

const BASE_URL = "/partners";

interface ListParams {
  limit?: number;
  offset?: number;
}

export const getPartners = (
  params?: ListParams,
): Promise<AxiosResponse<PaginatedResponse<Partner>>> => {
  return apiClient.get(BASE_URL + "/", { params });
};

export const getPartnerById = (id: number): Promise<AxiosResponse<Partner>> => {
  return apiClient.get(`${BASE_URL}/${id}/`);
};

export const createPartner = (data: unknown) => {
  return apiClient.post(BASE_URL + "/", data);
};

export const updatePartner = (id: number, data: unknown) => {
  return apiClient.put(`${BASE_URL}/${id}/`, data);
};

export const deletePartner = (id: number) => {
  return apiClient.delete(`${BASE_URL}/${id}/`);
};
