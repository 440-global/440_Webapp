"use client";
import { useGetUserProfile } from "@/api/auth";
import { Button, Card } from "@/components/ui";
import React, { useState } from "react";
import {
  RiErrorWarningLine,
  RiLoader5Line,
  RiLockPasswordLine,
  RiMailLine,
  RiMapPin2Line,
  RiPhoneLine,
  RiUserLine,
} from "react-icons/ri";
import type { MinorMerchant } from "@/types/types";
import ChangePasswordModal from "@/components/account/ChangePasswordModal";

/* ---------- helpers ---------- */

const dash = "—";

const text = (v: unknown) =>
  v === null || v === undefined || v === "" ? dash : String(v);

const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "?";

/* ---------- building blocks ---------- */

const InfoRow = ({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) => (
  <div className="flex items-start gap-3 py-4">
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
      {icon}
    </span>
    <div className="min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 wrap-break-word text-sm font-medium text-gray-900">
        {href && value !== dash ? (
          <a href={href} className="hover:text-(--primary) hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  </div>
);

/* ---------- profile body ---------- */

const ProfileDetails = ({
  m,
  onChangePassword,
}: {
  m: MinorMerchant;
  onChangePassword: () => void;
}) => (
  <div className="space-y-6">
    {/* identity */}
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
      {m.picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={m.picture}
          alt={m.name}
          className="h-24 w-24 shrink-0 rounded-full border border-(--border-default) object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-(--primary) text-3xl font-semibold text-white">
          {initials(m.name)}
        </div>
      )}
      <div className="min-w-0">
        <h2 className="truncate text-xl font-bold text-gray-900">{m.name}</h2>
        <p className="mt-0.5 truncate text-sm text-gray-500">{m.email}</p>
      </div>
    </div>

    {/* details */}
    <section className="rounded-xl border border-(--border-default) bg-white">
      <h2 className="border-b border-(--border-default) px-5 py-3 text-sm font-semibold text-gray-900">
        Personal information
      </h2>
      <dl className="divide-y divide-(--border-default) px-5">
        <InfoRow
          icon={<RiUserLine size={18} />}
          label="Full name"
          value={text(m.name)}
        />
        <InfoRow
          icon={<RiMailLine size={18} />}
          label="Email address"
          value={text(m.email)}
          href={`mailto:${m.email}`}
        />
        <InfoRow
          icon={<RiPhoneLine size={18} />}
          label="Phone number"
          value={text(m.phone)}
          href={`tel:${m.phone}`}
        />
        <InfoRow
          icon={<RiMapPin2Line size={18} />}
          label="Address"
          value={text(m.address)}
        />
      </dl>
    </section>

    {/* security */}
    <section className="rounded-xl border border-(--border-default) bg-white">
      <h2 className="border-b border-(--border-default) px-5 py-3 text-sm font-semibold text-gray-900">
        Security
      </h2>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <RiLockPasswordLine size={18} />
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">Password</p>
            <p className="text-xs text-gray-500">
              Change your password regularly to keep your account safe.
            </p>
          </div>
        </div>
        <Button className="py-2! px-3! rounded-xl!" onClick={onChangePassword}>
          Change Password
        </Button>
      </div>
    </section>
  </div>
);

/* ---------- page ---------- */

type Props = {};

const Profile = (props: Props) => {
  const { data: person, isPending, error } = useGetUserProfile();
  const [changeModal, setChangeModal] = useState(false);

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
          Profile Info
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your details, addresses, and preferences.
        </p>
      </div>

      <Card className="shadow-none border border-(--border-default)! py-4">
        {isPending ? (
          <div className="py-12 flex items-center justify-center">
            <RiLoader5Line
              size={48}
              className="animate-spin text-(--primary)"
            />
          </div>
        ) : error ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <RiErrorWarningLine size={48} className="text-red-500 mb-2" />
            <p>
              Something went wrong. Please reload the page or change your
              network
            </p>
          </div>
        ) : person ? (
          <ProfileDetails
            m={person as MinorMerchant}
            onChangePassword={() => setChangeModal(true)}
          />
        ) : null}
      </Card>

      {changeModal && (
        <ChangePasswordModal onClose={() => setChangeModal(false)} />
      )}
    </>
  );
};

export default Profile;