"use client";
import { useGetUserProfile } from "@/api/auth";
import { Button, Card } from "@/components/ui";
import React, { useState } from "react";
import {
  RiCheckboxCircleFill,
  RiCloseCircleLine,
  RiErrorWarningLine,
  RiLoader5Line,
  RiExternalLinkLine,
} from "react-icons/ri";
import type { Merchant } from "@/types/types";
import ChangePasswordModal from "@/components/account/ChangePasswordModal";

/* ---------- helpers ---------- */

const dash = "—";

const text = (v: unknown) =>
  v === null || v === undefined || v === "" ? dash : String(v);

const naira = (v: number | null | undefined) =>
  v === null || v === undefined
    ? dash
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(v);

const date = (v: string | null | undefined) => {
  if (!v) return dash;
  const d = new Date(v);
  return isNaN(d.getTime())
    ? dash
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "?";

const isOn = (v: unknown) => v === 1 || v === true;

/* ---------- small building blocks ---------- */

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-(--border-default) bg-white">
    <h2 className="border-b border-(--border-default) px-5 py-3 text-sm font-semibold text-gray-900">
      {title}
    </h2>
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 p-5 sm:grid-cols-2">
      {children}
    </dl>
  </section>
);

const Field = ({
  label,
  value,
  href,
  wide,
}: {
  label: string;
  value: React.ReactNode;
  href?: string | null;
  wide?: boolean;
}) => (
  <div className={wide ? "sm:col-span-2" : ""}>
    <dt className="text-xs text-gray-500">{label}</dt>
    <dd className="mt-0.5 wrap-break-word text-sm font-medium text-gray-900">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-(--primary) hover:underline"
        >
          {value}
          <RiExternalLinkLine size={14} />
        </a>
      ) : (
        value
      )}
    </dd>
  </div>
);

const Check = ({ label, ok }: { label: string; ok: boolean }) => (
  <li
    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
      ok
        ? "border-green-200 bg-green-50 text-green-800"
        : "border-gray-200 bg-gray-50 text-gray-500"
    }`}
  >
    {ok ? (
      <RiCheckboxCircleFill size={18} className="shrink-0 text-green-600" />
    ) : (
      <RiCloseCircleLine size={18} className="shrink-0 text-gray-400" />
    )}
    {label}
  </li>
);

const Pill = ({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "green" | "amber";
}) => {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

/* ---------- profile body ---------- */

const ProfileDetails = ({
  m,
  onChangePassword,
}: {
  m: Merchant;
  onChangePassword: () => void;
}) => {
  const score = Math.min(100, Math.max(0, m.completion_details?.score ?? 0));
  const location = [m.address, m.lga, m.state].filter(Boolean).join(", ");

  const platforms = [
    { label: "Instagram", handle: m.instagram_username ?? m.instagram },
    { label: "Facebook", handle: m.facebook },
    { label: "Twitter", handle: m.twitter },
    { label: "Jumia", handle: m.jumia_username ?? m.jumia },
    { label: "Jiji", handle: m.jiji_username ?? m.jiji },
    { label: "Konga", handle: m.konga_username ?? m.konga },
    { label: "Amazon", handle: m.Amazon_username },
    { label: "Ebay", handle: m.Ebay_username },
    { label: "Olist", handle: m.Olist_username },
  ].filter((p) => p.handle);

  return (
    <div className="space-y-6">
      {/* identity */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {m.picture ? (
          <img
            src={m.picture}
            alt={m.name}
            className="h-20 w-20 shrink-0 rounded-full border border-(--border-default) object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-(--primary) text-2xl font-semibold text-white">
            {initials(m.name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-gray-900 md:text-xl">
            {m.shop_name || m.name}
          </h2>
          <p className="text-sm text-gray-500">
            {m.name} · {m.email}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {isOn(m.verified) ? (
              <Pill tone="green">Verified</Pill>
            ) : (
              <Pill tone="amber">Not verified</Pill>
            )}
            <Pill>Tier {m.account_tier}</Pill>
            {m.business_type && <Pill>{m.business_type}</Pill>}
            {isOn(m.wholesale) && <Pill>Wholesale</Pill>}
            {isOn(m.reseller) && <Pill>Reseller</Pill>}
          </div>
        </div>

        {/* completion */}
        <div className="w-full shrink-0 sm:w-56">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-gray-500">Profile completion</span>
            <span className="font-semibold text-gray-900">{score}%</span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completion"
          >
            <div
              className="h-full rounded-full bg-(--primary) transition-[width] duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            {[
              ["Picture", m.completion_details?.picture],
              ["Bank", m.completion_details?.bank_details],
              ["Business", m.completion_details?.business_details],
              ["Phone", m.completion_details?.phone_validated],
            ].map(([label, done]) => (
              <li key={label as string} className="flex items-center gap-1">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    done ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                {label as string}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button className="py-2! px-3! rounded-xl!" onClick={onChangePassword}>
        Change Password
      </Button>

      {/* contact */}
      <Section title="Contact">
        <Field label="Full name" value={text(m.name)} />
        <Field label="Email" value={text(m.email)} />
        <Field label="Phone" value={text(m.phone)} />
        <Field label="WhatsApp" value={text(m.whatsapp_no)} />
        <Field label="Instagram phone" value={text(m.instagram_phone)} />
        <Field label="Date of birth" value={date(m.dob)} />
      </Section>

      {/* business */}
      <Section title="Business">
        <Field label="Shop name" value={text(m.shop_name)} />
        <Field label="Business type" value={text(m.business_type)} />
        <Field label="Business model" value={text(m.business_model)} />
        <Field label="Market" value={text(m.market_name ?? m.market)} />
        <Field label="Daily sales" value={naira(m.daily_sales)} />
        <Field label="CAC number" value={text(m.CAC)} />
        <Field
          label="Store link"
          value={text(m.store_link)}
          href={m.store_link}
        />
        <Field
          label="Catalogue link"
          value={text(m.global_catalogue_link)}
          href={m.global_catalogue_link}
        />
        {m.description && (
          <Field label="Description" value={m.description} wide />
        )}
        {m.interests && m.interests.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-xs text-gray-500">Interests</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {m.interests.map((i) => (
                <Pill key={i}>{i}</Pill>
              ))}
            </dd>
          </div>
        )}
      </Section>

      {/* address */}
      <Section title="Address">
        <Field label="Shop address" value={text(location)} wide />
        <Field label="Home address" value={text(m.home_address)} wide />
        <Field label="Major landmark" value={text(m.majorLandmark)} />
        <Field
          label="Address verified"
          value={isOn(m.address_verified) ? "Yes" : "No"}
        />
      </Section>

      {/* bank */}
      <Section title="Bank details">
        <Field label="Account name" value={text(m.account_name)} />
        <Field label="Account number" value={text(m.account_number)} />
        <Field
          label="Generated account number"
          value={text(m.generated_account_number)}
        />
        <Field label="Gift balance" value={naira(m.gift_balance)} />
      </Section>

      {/* credit */}
      <Section title="Credit">
        <Field label="Credit limit" value={naira(m.credit_limit)} />
        <Field
          label="Social credit limit"
          value={naira(m.social_credit_limit)}
        />
        <Field
          label="Account credit limit"
          value={naira(m.account_credit_limit)}
        />
        <Field
          label="Credit expires"
          value={date(m.credit_limit_expiry_date)}
        />
        <Field
          label="Upfront rate"
          value={m.upfront_rate != null ? `${m.upfront_rate}%` : dash}
        />
        <Field
          label="Monthly interest"
          value={
            m.monthly_interest_rate != null
              ? `${m.monthly_interest_rate}%`
              : dash
          }
        />
        <Field
          label="Max credit duration"
          value={
            m.max_credit_duration != null
              ? `${m.max_credit_duration} months`
              : dash
          }
        />
        <Field label="Has offer" value={isOn(m.has_offer) ? "Yes" : "No"} />
      </Section>

      {/* verification */}
      <section className="rounded-xl border border-(--border-default) bg-white">
        <h2 className="border-b border-(--border-default) px-5 py-3 text-sm font-semibold text-gray-900">
          Verification
        </h2>
        <ul className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <Check label="Email validated" ok={isOn(m.email_validated)} />
          <Check label="Phone validated" ok={isOn(m.phone_validated)} />
          <Check label="WhatsApp validated" ok={isOn(m.whatsapp_validated)} />
          <Check label="Profile approved" ok={isOn(m.approved_profile)} />
          <Check label="ID approved" ok={isOn(m.approved_id)} />
          <Check label="NIN slip approved" ok={isOn(m.approved_nin_slip)} />
          <Check
            label="Utility bill approved"
            ok={isOn(m.approved_utility_bill)}
          />
          <Check label="Store approved" ok={isOn(m.approved_store)} />
          <Check label="CAC approved" ok={isOn(m.approved_cac)} />
          <Check label="KYC completed" ok={isOn(m.kyc)} />
          <Check label="BVN added" ok={isOn(m.added_bvn)} />
          <Check label="SLA signed" ok={isOn(m.SLA_SIGNED)} />
        </ul>
      </section>

      {/* connected platforms */}
      {platforms.length > 0 && (
        <Section title="Connected platforms">
          {platforms.map((p) => (
            <Field key={p.label} label={p.label} value={text(p.handle)} />
          ))}
        </Section>
      )}

      {/* account */}
      <Section title="Account">
        <Field label="Member since" value={date(m.createdAt)} />
        <Field label="Last login" value={date(m.last_login)} />
        <Field label="Last updated" value={date(m.updatedAt)} />
        <Field label="Password changed" value={date(m.password_changed_at)} />
        <Field label="Account source" value={text(m.account_source)} />
        <Field label="App version" value={text(m.app_version)} />
      </Section>
    </div>
  );
};

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
          <>
            <ProfileDetails
              m={person as Merchant}
              onChangePassword={() => setChangeModal(true)}
            />
          </>
        ) : null}
      </Card>

      {changeModal && (
        <ChangePasswordModal onClose={() => setChangeModal(false)} />
      )}
    </>
  );
};

export default Profile;
