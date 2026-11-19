import http, { noToken } from "@/lib/http"
import { SaveProductPayload } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query"

export const useGetAllProducts = () => {
  return useQuery({
    queryKey: ["product"],
    queryFn: async () => {
      const res = await noToken.get("/products?start_date=null&end_date=null&category=null");
      return res?.data;
    },
  });
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await http.get("/category/categories");
      return res?.data?.data;
    },
  });
};

export const useGetSubCategory = (id: number) => {
  return useQuery({
    queryKey: ["sub-category", id],
    queryFn: async () => {
      const res = await http.get(`/category/category/${id}`);
      return res?.data?.data;
    },
    enabled: !!id
  });
};

export const useGetMarkets = () => {
  return useQuery({
    queryKey: ["market"],
    queryFn: async () => {
      const res = await http.get("/buyer/markets");
      return res?.data?.data?.markets;
    },
  });
};

export const useGetMarket = (id: number) => {
  return useQuery({
    queryKey: ["market", id],
    queryFn: async () => {
      const res = await http.get(`/buyer/market/${id}`);
      return res?.data?.data;
    },
  });
};

export const useGetSuppliers = () => {
  return useQuery({
    queryKey: ["supplier"],
    queryFn: async () => {
      const res = await http.get(`/buyer/suppliers`);
      return res?.data?.data;
    },
  });
};

export const useGetSupplier = (id: number, options?: any) => {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const res = await http.get(`/buyer/supplier/${id}`);
      return res?.data?.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useSaveProduct = () => {
  return useMutation({
    mutationFn: (body: SaveProductPayload) => {
      return http.post('/buyer/save', body);
    },
  });
};

export const useGetSavedProduct = (merchantId: string) => {
  return useQuery({
    queryKey: ['saved-products', merchantId],
    queryFn: async () => {
      const res = await http.get(`/buyer/saved/${merchantId}`);
      return res?.data;
    },
    enabled: !!merchantId,
  });
};

export const useDeleteSavedProduct = (productId: number) => {
  return useMutation({
    mutationFn: () => {
      return http.delete(`/buyer/saved/${productId}`);
    },
  });
};