import http from "@/lib/http";
import { ChangePassword, ChangePasswordAuth, Login, Merchant, MinorMerchant, PhoneResetPayload, ProfileData, RegisterPayload } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query"
import { getCrossSubdomainCookie } from "@/lib/utils";

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (body: RegisterPayload) => {
      return http.post("/buyer/register", body);
    },
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (body: Login) => {
      return http.post("/buyer/login", body);
    },
  });
};

export const useGetUserProfile = () => {
  // Only hit the profile endpoint for signed-in buyers. The token lives in a
  // cookie (not React state), so it is read on each render; it is part of the
  // key so a login/logout gives a fresh result instead of a stale one.
  const token = getCrossSubdomainCookie("440_token");
  return useQuery<Merchant>({
    queryKey: ["user", token],
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await http.get("/buyer/profile/details");
      return res?.data?.data;
    }
  })
};

export const useGetMinorUserProfile = () => {
  // Only hit the profile endpoint for signed-in buyers. The token lives in a
  // cookie (not React state), so it is read on each render; it is part of the
  // key so a login/logout gives a fresh result instead of a stale one.
  const token = getCrossSubdomainCookie("440_token");
  return useQuery<MinorMerchant>({
    queryKey: ["user", token],
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await http.get("/buyer/profile");
      return res?.data?.data.profile;
    }
  })
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (phone: string) => {
      return http.post("/buyer/reset-password", {
        phone
      });
    },
  });
};

export const useResetPasswordWithPhone = () => {
  return useMutation({
    mutationFn: (body: PhoneResetPayload) => {
      return http.post("/buyer/reset-password/phone/confirm", body);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (body: ChangePassword) => {
      return http.post("/buyer/change-password", body);
    },
  });
};

export const useChangePasswordAuth = () => {
  return useMutation({
    mutationFn: (body: ChangePasswordAuth) => {
      return http.post("/buyer/change-password-authenticated", body);
    },
  });
};