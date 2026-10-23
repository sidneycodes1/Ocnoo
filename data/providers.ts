// Social platforms a seller can point buyers at.
//
// WHY THIS FILE IS THE WHOLE FEATURE
// The store has no server, so it can never ask a platform "is this account
// yours?". Everything here is therefore self-declared, and the only real
// protection we can offer is that a declared link goes exactly where it says it
// does. That means the href a buyer clicks is *rebuilt by us from a validated
// handle* and is never the raw string somebody pasted. The rules below exist to
// make `instagram.com/legitSeller?u=attacker` and `facebook.com.evil.co/x`
// impossible to express.

export interface SocialProvider {
  key: string;
  label: string;
  /** Hosts a pasted URL may come from. Matched on an exact or dot-boundary suffix. */
  hosts: string[];
  /** What we ask the seller for. */
  fieldLabel: string;
  placeholder: string;
  /** A bare handle must match this in full. */
  handlePattern: RegExp;
  minLength: number;
  maxLength: number;
  /**
   * `profile` — a public page that identifies a person or shop.
   * `contact` — a way to reach them, which says nothing about who they are.
   */
  kind: "profile" | "contact";
  /** Path prefix that introduces the handle, e.g. TikTok and YouTube use `@name`. */
  handlePrefix?: string;
  /**
   * First path segments that are a feature of the site, not a username. Someone
   * pasting a share button's URL would otherwise "own" the handle `sharer`.
   */
  reserved?: string[];
  /**
   * Some platforms put the name behind a path prefix instead of in the first
   * segment. Tried before the first-segment rule, so a real channel URL is not
   * rejected as a feature name. Returning null falls through to the default.
   */
  extract?: (pathname: string) => string | null;
  /** Shown under the row where the affordance is weaker than it looks. */
  caveat?: string;
  /** Builds the URL we render. Never returns the caller's input. */
  canonicalUrl: (handle: string) => string;
}

/** Trim a pasted URL or handle down to the part that names the account. */
const strip = (s: string) => s.trim().replace(/^@+/, "");

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    key: "instagram",
    label: "Instagram",
    hosts: ["instagram.com", "instagr.am"],
    fieldLabel: "Instagram username",
    placeholder: "yourshop or instagram.com/yourshop",
    handlePattern: /^[A-Za-z0-9._]{1,30}$/,
    minLength: 1,
    maxLength: 30,
    kind: "profile",
    reserved: ["p", "reel", "stories", "explore", "accounts", "direct", "share"],
    canonicalUrl: (h) => `https://www.instagram.com/${h}/`,
  },
  {
    key: "facebook",
    label: "Facebook",
    hosts: ["facebook.com", "fb.com", "m.facebook.com"],
    fieldLabel: "Facebook page or profile name",
    placeholder: "yourpage or facebook.com/yourpage",
    // Page vanities allow dots and dashes; people profiles are letters/numbers.
    handlePattern: /^[A-Za-z0-9][A-Za-z0-9._-]{4,49}$/,
    minLength: 5,
    maxLength: 50,
    kind: "profile",
    reserved: ["sharer", "sharer.php", "dialog", "share", "tr", "l", "pages", "profile.php"],
    canonicalUrl: (h) => `https://www.facebook.com/${h}`,
  },
  {
    key: "x",
    label: "X",
    hosts: ["x.com", "twitter.com", "mobile.twitter.com"],
    fieldLabel: "X handle",
    placeholder: "@yourhandle or x.com/yourhandle",
    handlePattern: /^[A-Za-z0-9_]{1,15}$/,
    minLength: 1,
    maxLength: 15,
    kind: "profile",
    reserved: ["intent", "share", "hashtag", "home", "explore", "search", "i"],
    canonicalUrl: (h) => `https://x.com/${h}`,
  },
  {
    key: "tiktok",
    label: "TikTok",
    hosts: ["tiktok.com"],
    fieldLabel: "TikTok username",
    placeholder: "@yourname or tiktok.com/@yourname",
    handlePattern: /^[A-Za-z0-9._-]{1,24}$/,
    minLength: 1,
    maxLength: 24,
    kind: "profile",
    handlePrefix: "@",
    reserved: ["vm.tiktok.com", "share", "embed", "discover", "fyp"],
    canonicalUrl: (h) => `https://www.tiktok.com/@${h}`,
  },
  {
    key: "youtube",
    label: "YouTube",
    // `youtu.be` is deliberately absent: it only ever short-links a video, so
    // accepting it would turn a shared clip into a fake channel handle.
    hosts: ["youtube.com", "m.youtube.com"],
    fieldLabel: "YouTube handle or channel id",
    placeholder: "@yourchannel or youtube.com/@yourchannel",
    // Handles look like @name; custom URLs are letters/numbers/dot/dash/underscore.
    handlePattern: /^[A-Za-z0-9][A-Za-z0-9._-]{2,39}$/,
    minLength: 3,
    maxLength: 40,
    kind: "profile",
    handlePrefix: "@",
    reserved: ["watch", "shorts", "channel", "c", "user", "embed", "results", "feed"],
    // youtube.com/channel/UC…, /c/name and /user/name all name a channel.
    extract: (p) => p.match(/^\/(?:channel|c|user)\/([^/]+)/)?.[1] ?? null,
    canonicalUrl: (h) =>
      /^UC[\w-]{22}$/.test(h)
        ? `https://www.youtube.com/channel/${h}`
        : `https://www.youtube.com/@${h}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    hosts: ["t.me", "telegram.me", "telegram.dog"],
    fieldLabel: "Telegram username",
    placeholder: "yourname or t.me/yourname",
    // Telegram requires at least 5 characters, letters/digits/underscore.
    handlePattern: /^[A-Za-z][A-Za-z0-9_]{4,31}$/,
    minLength: 5,
    maxLength: 32,
    kind: "profile",
    reserved: ["joinchat", "s", "share", "iv"],
    canonicalUrl: (h) => `https://t.me/${h}`,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    hosts: ["wa.me", "whatsapp.com", "api.whatsapp.com"],
    fieldLabel: "WhatsApp number",
    placeholder: "2348138855603",
    // Digits only, stored without the plus. 7010 is the E.164 ceiling.
    handlePattern: /^[1-9][0-9]{6,14}$/,
    minLength: 7,
    maxLength: 15,
    kind: "contact",
    caveat:
      "A WhatsApp number is a way to reach a seller, not proof of who they are — WhatsApp has no public profile to check against.",
    reserved: ["send", "dav"],
    canonicalUrl: (h) => `https://wa.me/${h}`,
  },
];

export function getProvider(key: string): SocialProvider | undefined {
  return SOCIAL_PROVIDERS.find((p) => p.key === key);
}

export type NormaliseResult =
  | { ok: true; handle: string; url: string }
  | { ok: false; error: string };

/** `true` for `host` itself and any `sub.host`, never for `notthishost.com`. */
function hostMatches(host: string, allowed: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  return h === allowed || h.endsWith(`.${allowed}`);
}

/**
 * Turn whatever the seller typed into a validated handle and a URL we built
 * ourselves. Accepts a bare handle or a full link, and refuses anything whose
 * destination we cannot state with certainty.
 */
export function normaliseHandle(
  provider: SocialProvider,
  input: string,
): NormaliseResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Enter your account." };

  let handle = raw;

  // A URL: parse it, and only accept it if the host is really the platform's.
  // No account name on any of these platforms contains a slash, so a slash in
  // what was typed means it is a link even if the `https://` was left off.
  const looksLikeUrl =
    /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) || /^\/\//.test(raw) || raw.includes("/");
  if (looksLikeUrl) {
    const absolute = /^\/\//.test(raw)
      ? `https:${raw}`
      : /^[a-z][a-z0-9+.-]*:\/\//i.test(raw)
        ? raw
        : `https://${raw}`;
    let url: URL;
    try {
      url = new URL(absolute);
    } catch {
      return { ok: false, error: "That link cannot be read." };
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { ok: false, error: "Only http or https links are accepted." };
    }
    // `instagram.com.evil.co` must not pass as Instagram.
    if (!provider.hosts.some((h) => hostMatches(url.hostname, h))) {
      return {
        ok: false,
        error: `That link is not a ${provider.label} address.`,
      };
    }
    // Credentials in a URL are a redirect trick, never a real profile.
    if (url.username || url.password) {
      return { ok: false, error: "Remove the user info from that link." };
    }
    // The account is the first path segment — or, where the platform nests it
    // behind a prefix, whatever `extract` pulls out. Everything after it is
    // ignored, so a payload cannot hide in the tail.
    const first =
      provider.extract?.(url.pathname) ??
      url.pathname.split("/").filter(Boolean)[0] ??
      "";
    if (!first) {
      return { ok: false, error: `That link has no ${provider.label.toLowerCase()} account in it.` };
    }
    handle = first;
  }

  handle = strip(handle);
  if (provider.handlePrefix) {
    handle = handle.replace(
      new RegExp(`^${provider.handlePrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      "",
    );
  }
  // WhatsApp is a phone number; people paste it with separators.
  if (provider.key === "whatsapp") {
    handle = handle.replace(/[\s()-]/g, "").replace(/^00/, "+").replace(/^\+?/, "");
    // A local 080… number has no country code and would build a wrong wa.me link.
    if (/^0\d+$/.test(handle)) {
      return {
        ok: false,
        error: "Include the country code, for example 234 then the number.",
      };
    }
  }

  if (provider.reserved?.includes(handle.toLowerCase())) {
    return {
      ok: false,
      error: `“${handle}” is part of ${provider.label} itself, not an account name.`,
    };
  }
  if (handle.length < provider.minLength) {
    return { ok: false, error: `That is too short to be a ${provider.label} account.` };
  }
  if (handle.length > provider.maxLength) {
    return { ok: false, error: `That is longer than ${provider.label} allows.` };
  }
  if (!provider.handlePattern.test(handle)) {
    return {
      ok: false,
      error:
        provider.key === "whatsapp"
          ? "Digits only, with the country code and no plus sign."
          : "Only the characters that platform allows in a name.",
    };
  }

  return { ok: true, handle, url: provider.canonicalUrl(handle) };
}

/** How a declared account is shown to a buyer. */
export function displayHandle(provider: SocialProvider, handle: string): string {
  return provider.handlePrefix ? `${provider.handlePrefix}${handle}` : handle;
}

/** The host a buyer will actually land on, spelled out so it can be checked. */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
