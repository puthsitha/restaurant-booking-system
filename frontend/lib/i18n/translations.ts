// Translation dictionaries for the customer, owner, and admin surfaces.
// Keep `en` and `km` structurally identical — TranslationKey below is
// derived from `en`, so a missing `km` key is still typed but will render
// English as its fallback value (see getMessage in context.tsx).

const en = {
  common: {
    logOut: "Log out",
    logOutConfirmTitle: "Log out?",
    logOutConfirmBody: "You'll need to sign in again to continue.",
    cancel: "Cancel",
    checkingSession: "Checking your session…",
    language: "Language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    openMenu: "Open menu"
  },
  customerHeader: {
    myBookings: "My bookings",
    logIn: "Log in"
  },
  customerFooter: {
    discover: "Discover",
    account: "Account",
    fineDining: "Fine dining",
    blurb:
      "Book the best tables across Cambodia — Phnom Penh, Siem Reap, Kampot and beyond.",
    poweredBy: "Powered by"
  },
  sessionEndedModal: {
    title: "You've been logged out",
    contactSupport:
      "If you think this isn't right, please kindly contact our customer support team — we're happy to help.",
    okay: "Okay"
  },
  notifications: {
    pendingApproval: "Pending approval",
    open: "Notifications"
  },
  owner: {
    brand: "Owner",
    navDashboard: "Dashboard",
    navRestaurants: "Restaurants",
    navBookings: "Bookings",
    navRequests: "Requests",
    noPendingBookings: "No pending bookings.",
    viewAllBookings: "View all bookings",
    loginTitle: "Restaurant owner login",
    loginSubtitle: "Sign in to manage your restaurant."
  },
  admin: {
    brand: "Admin",
    navDashboard: "Dashboard",
    navRestaurants: "Restaurants",
    navBookings: "Bookings",
    navUsers: "Users",
    navRequests: "Requests",
    navTags: "Tags",
    navSettings: "Settings",
    nothingAwaitingReview: "Nothing awaiting review.",
    viewAllRestaurants: "View all restaurants",
    loginTitle: "Platform admin login",
    loginSubtitle: "Sign in to moderate the platform."
  },
  auth: {
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    somethingWentWrong: "Something went wrong"
  }
} as const;

const km = {
  common: {
    logOut: "ចាកចេញ",
    logOutConfirmTitle: "ចាកចេញឬ?",
    logOutConfirmBody: "អ្នកនឹងត្រូវចូលម្តងទៀតដើម្បីបន្ត។",
    cancel: "បោះបង់",
    checkingSession: "កំពុងពិនិត្យសម័យរបស់អ្នក…",
    language: "ភាសា",
    theme: "រូបរាង",
    themeLight: "ភ្លឺ",
    themeDark: "ងងឹត",
    themeSystem: "តាមប្រព័ន្ធ",
    openMenu: "បើកម៉ឺនុយ"
  },
  customerHeader: {
    myBookings: "ការកក់របស់ខ្ញុំ",
    logIn: "ចូល"
  },
  customerFooter: {
    discover: "ស្វែងរក",
    account: "គណនី",
    fineDining: "ភោជនីយដ្ឋានប្រណីត",
    blurb: "កក់តុល្អបំផុតទូទាំងកម្ពុជា — ភ្នំពេញ សៀមរាប កំពត និងផ្សេងទៀត។",
    poweredBy: "ដំណើរការដោយ"
  },
  sessionEndedModal: {
    title: "អ្នកត្រូវបានចាកចេញ",
    contactSupport:
      "ប្រសិនបើអ្នកគិតថានេះមិនត្រឹមត្រូវ សូមទាក់ទងក្រុមជំនួយអតិថិជនរបស់យើង — យើងរីករាយជួយអ្នក។",
    okay: "យល់ព្រម"
  },
  notifications: {
    pendingApproval: "រង់ចាំការអនុម័ត",
    open: "ការជូនដំណឹង"
  },
  owner: {
    brand: "ម្ចាស់ភោជនីយដ្ឋាន",
    navDashboard: "ផ្ទាំងគ្រប់គ្រង",
    navRestaurants: "ភោជនីយដ្ឋាន",
    navBookings: "ការកក់",
    navRequests: "សំណើ",
    noPendingBookings: "មិនមានការកក់រង់ចាំ។",
    viewAllBookings: "មើលការកក់ទាំងអស់",
    loginTitle: "ចូលគណនីម្ចាស់ភោជនីយដ្ឋាន",
    loginSubtitle: "ចូលដើម្បីគ្រប់គ្រងភោជនីយដ្ឋានរបស់អ្នក។"
  },
  admin: {
    brand: "អ្នកគ្រប់គ្រង",
    navDashboard: "ផ្ទាំងគ្រប់គ្រង",
    navRestaurants: "ភោជនីយដ្ឋាន",
    navBookings: "ការកក់",
    navUsers: "អ្នកប្រើប្រាស់",
    navRequests: "សំណើ",
    navTags: "ស្លាក",
    navSettings: "ការកំណត់",
    nothingAwaitingReview: "គ្មានអ្វីរង់ចាំពិនិត្យទេ។",
    viewAllRestaurants: "មើលភោជនីយដ្ឋានទាំងអស់",
    loginTitle: "ចូលគណនីអ្នកគ្រប់គ្រងវេទិកា",
    loginSubtitle: "ចូលដើម្បីត្រួតពិនិត្យវេទិកា។"
  },
  auth: {
    email: "អ៊ីមែល",
    password: "ពាក្យសម្ងាត់",
    signIn: "ចូល",
    signingIn: "កំពុងចូល…",
    somethingWentWrong: "មានបញ្ហាមួយបានកើតឡើង"
  }
} as const;

export const dictionaries = { en, km };

type Dictionary = typeof en;

type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[]> = T extends []
  ? never
  : T extends [infer F extends string]
    ? F
    : T extends [infer F extends string, ...infer R extends string[]]
      ? `${F}.${Join<R>}`
      : string;

export type TranslationKey = Join<PathsToStringProps<Dictionary>>;

export function getMessage(dictionary: Record<string, unknown>, key: TranslationKey): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined),
      dictionary
    );
  return typeof value === "string" ? value : key;
}
