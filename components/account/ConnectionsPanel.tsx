"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useConnections } from "@/context/ConnectionsContext";
import {
  SOCIAL_PROVIDERS,
  displayHandle,
  displayHost,
  getProvider,
  normaliseHandle,
  type SocialProvider,
} from "@/data/providers";
import {
  ChevronDownIcon,
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/ui/icons";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";

const ICONS: Record<string, (p: { size?: number; className?: string }) => JSX.Element> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  x: XIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
  telegram: TelegramIcon,
  whatsapp: (p) => <WhatsAppIcon {...p} />,
};

function ProviderIcon({ provider, size = 22 }: { provider: string; size?: number }) {
  const Cmp = ICONS[provider];
  return Cmp ? <Cmp size={size} /> : <XIcon size={size} />;
}

/**
 * The add/change form. Validation runs as you type but only speaks when there
 * is something wrong with what is there, so an empty field is not an error.
 */
function ProviderEditor({
  provider,
  initial = "",
  onSave,
  onCancel,
}: {
  provider: SocialProvider;
  initial?: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { connect } = useConnections();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Re-derive on every keystroke: the preview is the point of the exercise, so
  // it must be built by the same function that builds what gets saved.
  useEffect(() => {
    if (!value.trim()) {
      setPreview(null);
      setError(null);
      return;
    }
    const result = normaliseHandle(provider, value);
    setPreview(result.ok ? result.url : null);
    setError(result.ok ? null : result.error);
  }, [value, provider]);

  function submit() {
    const result = connect(provider.key, value);
    if (result.ok) {
      onSave();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="border-t border-line bg-page px-4 py-4">
      <p className="font-sans text-sm font-bold uppercase tracking-wide">
        {provider.fieldLabel}
      </p>
      <label className="sr-only" htmlFor={`conn-${provider.key}`}>
        {provider.fieldLabel}
      </label>
      <Input
        id={`conn-${provider.key}`}
        autoFocus
        value={value}
        placeholder={provider.placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `conn-error-${provider.key}` : undefined}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        className="mt-2"
      />

      {error && (
        <p
          id={`conn-error-${provider.key}`}
          role="alert"
          className="mt-2 font-sans text-sm font-bold"
        >
          {error}
        </p>
      )}

      {preview && (
        <p className="mt-2 font-sans text-sm text-black/60">
          This will link to{" "}
          <span className="font-bold text-black">{displayHost(preview)}</span>
          /{displayHandle(provider, preview.split("/").filter(Boolean).pop() ?? "")}
        </p>
      )}

      {provider.caveat && (
        <p className="mt-2 font-sans text-sm text-black/60">{provider.caveat}</p>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          variant="primary"
          shape="pill"
          tone="default"
          labelCase="none"
          padding="tight"
          onClick={submit}
          disabled={Boolean(error) || !value.trim()}
        >
          Save
        </Button>
        <Button
          variant="secondary"
          shape="pill"
          tone="default"
          labelCase="none"
          padding="tight"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function ConnectionsPanel() {
  const { connections, hydrated, disconnect } = useConnections();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [addKey, setAddKey] = useState<string | null>(null);

  const connectedKeys = new Set(connections.map((c) => c.provider));
  const available = SOCIAL_PROVIDERS.filter((p) => !connectedKeys.has(p.key));

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[70px] animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-xl bg-surface p-4 font-sans text-sm leading-relaxed text-black/70">
        You type these in. OCNOO has no connection to any of these platforms and
        cannot confirm an account belongs to you. What this page does guarantee
        is narrower: a saved link is rebuilt from the name alone, so it can only
        ever open that platform&apos;s page for that account, and the address is
        shown to you before anything is saved.
      </p>

      {/* ---- Connected ---- */}
      <section aria-labelledby="connected-heading">
        <h2
          id="connected-heading"
          className="font-sans text-sm font-extrabold uppercase tracking-wide"
        >
          Connected {connections.length > 0 ? `(${connections.length})` : ""}
        </h2>
        {connections.length === 0 ? (
          <p className="mt-2 font-sans text-sm text-black/55">
            Nothing declared yet. Add one below.
          </p>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-xl border border-line bg-white">
            {connections.map((conn) => {
              const provider = getProvider(conn.provider);
              if (!provider) return null;
              const open = openKey === conn.provider;
              return (
                <li key={conn.provider} className="border-b border-line last:border-b-0">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface"
                    >
                      <ProviderIcon provider={conn.provider} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-sm font-extrabold uppercase tracking-wide">
                        {provider.label}
                      </p>
                      <a
                        href={conn.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="block truncate font-sans text-sm text-black/60 underline decoration-line underline-offset-4 hover:text-black"
                      >
                        {displayHandle(provider, conn.handle)}
                        {/* A real space, not just `ml-1`: the margin is visual
                            only, so the link's text — what a screen reader
                            announces and what a selection copies — otherwise
                            runs the handle into the word "on". */}
                        {" "}
                        <span className="ml-1 text-black/40">
                          · on {displayHost(conn.url)}
                        </span>
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Only one editor on screen at a time.
                        setAddKey(null);
                        setOpenKey(open ? null : conn.provider);
                      }}
                      aria-expanded={open}
                      aria-label={`${open ? "Close" : "Manage"} ${provider.label}`}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-black/50 hover:bg-page hover:text-black"
                    >
                      <ChevronDownIcon
                        className={open ? "rotate-180 transition-transform" : "transition-transform"}
                      />
                    </button>
                  </div>

                  {open && (
                    <>
                      <ProviderEditor
                        provider={provider}
                        initial={displayHandle(provider, conn.handle)}
                        onSave={() => setOpenKey(null)}
                        onCancel={() => setOpenKey(null)}
                      />
                      <div className="flex items-center justify-between gap-3 border-t border-line bg-page px-4 py-3">
                        <span className="font-sans text-sm text-black/55">
                          Removes this link from your seller profile.
                        </span>
                        <Button
                          variant="secondary"
                          shape="pill"
                          labelCase="none"
                          padding="tight"
                          onClick={() => {
                            disconnect(conn.provider);
                            setOpenKey(null);
                          }}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---- Add connection ---- */}
      {available.length > 0 && (
        <section aria-labelledby="add-heading">
          <h2
            id="add-heading"
            className="font-sans text-sm font-extrabold uppercase tracking-wide"
          >
            Add connection
          </h2>
          <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-7">
            {available.map((provider) => (
              <li key={provider.key}>
                <button
                  type="button"
                  onClick={() => {
                    setAddKey(addKey === provider.key ? null : provider.key);
                    setOpenKey(null);
                  }}
                  aria-pressed={addKey === provider.key}
                  aria-label={`Add ${provider.label}`}
                  className={`flex h-[68px] w-full flex-col items-center justify-center gap-1 rounded-xl border bg-white transition-colors ${
                    addKey === provider.key
                      ? "border-black"
                      : "border-line hover:border-black/30"
                  }`}
                >
                  <ProviderIcon provider={provider.key} size={24} />
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wide text-black/55">
                    {provider.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {addKey && getProvider(addKey) && (
            <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white">
              <div className="flex items-center gap-3 px-4 py-3">
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface"
                >
                  <ProviderIcon provider={addKey} />
                </span>
                <p className="font-sans text-sm font-extrabold uppercase tracking-wide">
                  {getProvider(addKey)!.label}
                </p>
              </div>
              <ProviderEditor
                provider={getProvider(addKey)!}
                onSave={() => setAddKey(null)}
                onCancel={() => setAddKey(null)}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
