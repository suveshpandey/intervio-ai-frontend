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
import {
  useSession,
  useUpdateProfile,
  useChangePassword,
  useDeleteAccount,
} from '@/lib/auth';
import { ApiError } from '@/lib/api';

type Msg = { type: 'success' | 'error'; text: string } | null;

export default function AccountPage() {
  const { user } = useSession();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [name, setName] = useState(user?.name ?? '');
  const [profileMsg, setProfileMsg] = useState<Msg>(null);

  const [pwOpen, setPwOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState<Msg>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const initials = initialsFor(user.name, user.email);

  return (
    <div>
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

      <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        {/* Identity card */}
        <aside className="lg:sticky lg:top-6">
          <div className="edge-top overflow-hidden rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl border border-border bg-primary/15 text-lg font-semibold text-primary">
                {initials}
              </span>
              <p className="mt-4 font-semibold tracking-tight">{user.name || 'Your account'}</p>
              <p className="mt-0.5 max-w-full truncate text-sm text-muted-foreground">
                {user.email}
              </p>
              <Badge tone={isEmailAccount ? 'muted' : 'default'} className="mt-3">
                {isEmailAccount ? 'Email & password' : 'Google'}
              </Badge>
            </div>

            <div className="relative mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <MetaRow label="Sign-in" value={isEmailAccount ? 'Email & password' : 'Google'} />
              <MetaRow label="Status" value="Active" dot />
            </div>
          </div>
        </aside>

        {/* Settings */}
        <div className="space-y-6">
          <SettingsCard
            icon={<UserIcon className="h-[18px] w-[18px]" />}
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
            </div>
          </SettingsCard>

          {/* Password — collapsed to a short card until you choose to change it */}
          {isEmailAccount ? (
            <section className="edge-top overflow-hidden rounded-2xl border border-border bg-card">
              <button
                type="button"
                onClick={() => {
                  setPwOpen((v) => !v);
                  setPwMsg(null);
                }}
                aria-expanded={pwOpen}
                className="flex w-full items-center gap-3 p-6 text-left transition-colors hover:bg-muted/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary">
                  <LockIcon className="h-[18px] w-[18px]" />
                </span>
                <div className="flex-1">
                  <h2 className="text-base font-semibold tracking-tight">Password</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Change the password you use to sign in.
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-primary">
                  {pwOpen ? 'Cancel' : 'Update password'}
                </span>
              </button>

              {pwOpen && (
                <>
                  <div className="space-y-4 border-t border-border p-6">
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
                  <div className="flex items-center justify-between gap-3 border-t border-border bg-surface/40 px-6 py-4">
                    <StatusMessage msg={pwMsg} />
                    <Button
                      onClick={onChangePassword}
                      loading={changePassword.isPending}
                      disabled={!current || !next || !confirm}
                    >
                      {changePassword.isPending ? 'Updating…' : 'Update password'}
                    </Button>
                  </div>
                </>
              )}
            </section>
          ) : (
            <SettingsCard
              icon={<LockIcon className="h-[18px] w-[18px]" />}
              title="Password"
              description="How you sign in to Intervio."
            >
              <p className="text-sm text-muted-foreground">
                You sign in with Google, so there&apos;s no password to manage here. Password and
                security are handled by your Google account.
              </p>
            </SettingsCard>
          )}

          {/* Danger zone */}
          <section className="overflow-hidden rounded-2xl border border-destructive/30 bg-card">
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Delete account</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Permanently delete your account and all your data. This can&apos;t be undone.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(true)}
                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                Delete account
              </Button>
            </div>
          </section>
        </div>
      </div>

      {deleteOpen && (
        <DeleteAccountModal
          isEmailAccount={isEmailAccount}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </div>
  );
}

function DeleteAccountModal({
  isEmailAccount,
  onClose,
}: {
  isEmailAccount: boolean;
  onClose: () => void;
}) {
  const deleteAccount = useDeleteAccount();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canDelete = isEmailAccount ? password.length > 0 : confirmText === 'DELETE';

  async function onConfirm() {
    setError(null);
    try {
      await deleteAccount.mutateAsync({ password: isEmailAccount ? password : undefined });
      // Full teardown → hard navigate to the landing page (skips the app auth guard).
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete your account.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="animate-pop relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/50">
        <h2 className="text-lg font-semibold tracking-tight">Delete your account?</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This permanently deletes your account and everything in it — resumes, plans, and
          interviews. This action can&apos;t be undone.
        </p>

        <div className="mt-5">
          {isEmailAccount ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Enter your password to confirm</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                icon={<LockIcon />}
                autoComplete="current-password"
              />
            </label>
          ) : (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Type <span className="font-mono text-destructive">DELETE</span> to confirm
              </span>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </label>
          )}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={deleteAccount.isPending}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            loading={deleteAccount.isPending}
            disabled={!canDelete}
            className="bg-destructive text-white hover:opacity-90"
          >
            {deleteAccount.isPending ? 'Deleting…' : 'Delete account'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function initialsFor(name: string | null, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function MetaRow({ label, value, dot }: { label: string; value: string; dot?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 font-medium">
        {dot && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
        {value}
      </span>
    </div>
  );
}

/* ── Building blocks ── */

function SettingsCard({
  icon,
  title,
  description,
  children,
  footer,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="edge-top overflow-hidden rounded-2xl border border-border bg-card">
      <div className="p-6">
        <div className="flex items-start gap-3">
          {icon && (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary">
              {icon}
            </span>
          )}
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
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
