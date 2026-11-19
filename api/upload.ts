import http from "@/lib/http";
import { useMutation } from "@tanstack/react-query";

export type UploadPayload = {
  filename: string;
  contentType: string;
  contentLength: number;
  folder: string;
};

export type PresignResponse = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  expiresIn: number;
};

export const useUploadFiles = () =>
  useMutation({
    mutationKey: ["uploadFiles"],
    mutationFn: async (payload: UploadPayload) => {
      const res = await http.post<{ data: PresignResponse }>(
        "/uploads/presign",
        payload,
      );
      return res.data.data;
    },
  });
