'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/app/page-header';
import {
  ChevronRightIcon,
  MailIcon,
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
} from '@/components/icons';
import { useSession, useUpdateProfile, useChangePassword } from '@/lib/auth';
import { ApiError } from '@/lib/api';

type Msg = { type: 'success' | 'error'; text: string } | null;

export default function AccountPage() {
  const { user } = useSession();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [name, setName] = useState(user?.name ?? '');
  const [profileMsg, setProfileMsg] = useState<Msg>(null);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState<Msg>(null);

  if (!user) return null;

  const isEmailAccount = user.authProvider === 'email';
  const nameChanged = name.trim() !== (user.name ?? '');

  async function onSaveProfile() {
    setProfileMsg(null);
    const trimmed = name.trim();
    if (!trimmed) return setProfileMsg({ type: 'error', text: 'Name cannot be empty.' });
    try {
      await updateProfile.mutateAsync({ name: trimmed });
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Could not update profile.',
      });
    }
  }

  async function onChangePassword() {
    setPwMsg(null);
    if (next.length < 8)
      return setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
    if (next !== confirm)
      return setPwMsg({ type: 'error', text: 'New passwords do not match.' });
    try {
      await changePassword.mutateAsync({ currentPassword: current, newPassword: next });
      setCurrent('');
      setNext('');
      setConfirm('');
      setPwMsg({ type: 'success', text: 'Password updated.' });
    } catch (err) {
      setPwMsg({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Could not update password.',
      });
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        breadcrumb={
          <>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="text-foreground">Account</span>
          </>
        }
        title="Account"
        description="Manage your profile and sign-in details."
      />

      <div className="space-y-6">
        {/* Profile */}
        <SettingsCard
          title="Profile"
          description="This is how you'll be addressed across Intervio."
          footer={
            <>
              <StatusMessage msg={profileMsg} />
              <Button onClick={onSaveProfile} loading={updateProfile.isPending} disabled={!nameChanged}>
                {updateProfile.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                icon={<UserIcon />}
                maxLength={120}
              />
            </Field>
            <Field label="Email" hint="Your email is your sign-in and can't be changed.">
              <Input value={user.email} icon={<MailIcon />} readOnly disabled />
            </Field>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Signed in with</span>
              <Badge tone={isEmailAccount ? 'muted' : 'default'}>
                {isEmailAccount ? 'Email & password' : 'Google'}
              </Badge>
            </div>
          </div>
        </SettingsCard>

        {/* Password */}
        {isEmailAccount ? (
          <SettingsCard
            title="Password"
            description="Update the password you use to sign in."
            footer={
              <>
                <StatusMessage msg={pwMsg} />
                <Button
                  onClick={onChangePassword}
                  loading={changePassword.isPending}
                  disabled={!current || !next || !confirm}
                >
                  {changePassword.isPending ? 'Updating…' : 'Update password'}
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <Field label="Current password">
                <PasswordField
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="Current password"
                  autoComplete="current-password"
                />
              </Field>
              <Field label="New password" hint="At least 8 characters.">
                <PasswordField
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm new password">
                <PasswordField
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
              </Field>
            </div>
          </SettingsCard>
        ) : (
          <SettingsCard title="Password" description="How you sign in to Intervio.">
            <p className="text-sm text-muted-foreground">
              You sign in with Google, so there&apos;s no password to manage here. Password and
              security are handled by your Google account.
            </p>
          </SettingsCard>
        )}
      </div>
    </div>
  );
}

/* ── Building blocks ── */

function SettingsCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="edge-top overflow-hidden rounded-2xl border border-border bg-card">
      <div className="p-6">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-5">{children}</div>
      </div>
      {footer && (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface/40 px-6 py-4">
          {footer}
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function PasswordField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <Input
      {...props}
      type={show ? 'text' : 'password'}
      icon={<LockIcon />}
      trailing={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      }
    />
  );
}

function StatusMessage({ msg }: { msg: Msg }) {
  if (!msg) return <span className="text-sm text-muted-foreground" />;
  return (
    <span className={msg.type === 'error' ? 'text-sm text-destructive' : 'text-sm text-success'}>
      {msg.text}
    </span>
  );
}
