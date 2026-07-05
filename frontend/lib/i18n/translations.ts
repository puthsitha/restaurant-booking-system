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
    somethingWentWrong: "Something went wrong",
    continueWithGoogle: "Continue with Google",
    googleUnavailable:
      "Google sign-in isn't available in this browser right now — please sign in with your phone number instead."
  },
  home: {
    heroTagline: "TableSite · Cambodia",
    heroTitlePrefix: "Find your table across",
    heroTitleHighlight: "Cambodia",
    heroSubtitle: "Reserve Cambodia's best tables — bilingual, dual-currency, KHQR-ready.",
    searchPlaceholder: "Search by restaurant name…",
    search: "Search",
    statRestaurants: "Restaurants",
    statProvinces: "Provinces",
    statReady: "Ready",
    browseByCuisine: "Browse by cuisine",
    popularRestaurants: "Popular restaurants",
    viewAll: "View all →",
    emptyTitle: "The dining room is warming up",
    emptyMessage: "No restaurants have opened their doors yet — check back soon for new spots.",
    ownerCtaTitle: "Own a restaurant?",
    ownerCtaBody:
      "List your restaurant on TableSite and manage bookings, tables, and menus from one dashboard.",
    ownerCtaButton: "Open owner portal"
  },
  cuisines: {
    khmer: "Khmer",
    seafood: "Seafood",
    bbqGrill: "BBQ & Grill",
    fineDining: "Fine dining",
    cafe: "Café",
    streetFood: "Street food"
  },
  bookingsPage: {
    title: "My bookings",
    tabUpcoming: "Upcoming",
    tabPast: "Past",
    signInTitle: "Sign in to see your bookings",
    signInMessage: "Log in from the header to view and manage your reservations.",
    loadError: "Couldn't load your bookings.",
    cancelError: "Couldn't cancel this booking.",
    emptyPastTitle: "No past bookings",
    emptyUpcomingTitle: "No upcoming bookings",
    emptyMessage: "Find a restaurant you love and reserve a table — it only takes a minute.",
    browseRestaurants: "Browse restaurants",
    confirmation: "Confirmation {code}",
    cancelBooking: "Cancel booking",
    cancelling: "Cancelling…",
    checkInCode: "Check-in code",
    checkIn: "Check-in",
    previous: "Previous",
    next: "Next",
    pageOf: "Page {page} of {total}",
    cancelModalTitle: "Cancel this booking?",
    cancelModalBody: "This can't be undone.",
    keepBooking: "Keep booking",
    guestsCount: "{count} guests",
    at: "at"
  },
  profilePage: {
    signInTitle: "Sign in to see your profile",
    signInMessage: "Log in from the header to manage saved restaurants and payment methods.",
    savedRestaurants: "Saved restaurants",
    loadSavedError: "Couldn't load saved restaurants.",
    emptySavedTitle: "No saved restaurants yet",
    emptySavedMessage: "Tap the heart on a restaurant to save it here.",
    browseRestaurants: "Browse restaurants",
    remove: "Remove",
    paymentMethods: "Payment methods",
    loadPaymentError: "Couldn't load payment methods.",
    addShort: "+ Add",
    emptyPaymentTitle: "No payment methods saved",
    emptyPaymentMessage: "Add a mobile payment account to check out faster.",
    default: "Default",
    removePaymentError: "Couldn't remove this payment method.",
    addPaymentMethod: "Add a payment method",
    provider: "Provider",
    label: "Label",
    labelPlaceholder: "e.g. Personal ABA",
    detailOptional: "Detail (optional)",
    detailPlaceholder: "Account number or note",
    setAsDefault: "Set as default",
    adding: "Adding…",
    addPaymentMethodButton: "Add payment method"
  },
  searchPage: {
    title: "Search restaurants",
    restaurantName: "Restaurant name",
    restaurantNamePlaceholder: "e.g. Malis",
    city: "City",
    cityPlaceholder: "e.g. Phnom Penh",
    cuisine: "Cuisine",
    cuisinePlaceholder: "e.g. Khmer",
    tag: "Tag",
    anyTag: "Any tag",
    price: "Price",
    any: "Any",
    search: "Search",
    clear: "Clear",
    resultsFound: "{count} restaurants found",
    previous: "Previous",
    next: "Next",
    pageOf: "Page {page} of {total}",
    loadError: "Couldn't load restaurants. Try again.",
    emptyTitle: "No tables match that search",
    emptyMessage:
      "Try a different city, cuisine, or clear a filter — your next favorite spot is still out there.",
    clearFilters: "Clear filters"
  },
  restaurantPage: {
    dressCode: "Dress code",
    deposit: "Deposit",
    depositNotRequired: "Not required",
    depositAmount: "{amount} per booking",
    cancellation: "Cancellation",
    cancellationNotice: "{hours}h notice",
    parking: "Parking",
    parkingAvailable: "Available",
    hours: "Hours",
    closed: "Closed",
    menu: "Menu",
    gallery: "Gallery",
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    }
  },
  bookingWidget: {
    reserveTable: "Reserve a table",
    date: "Date",
    partySize: "Party size",
    time: "Time",
    closedOnDate: "Closed on this date",
    closedOnDay: "Closed on this day",
    seating: "Seating",
    seatingIndoor: "Indoor",
    seatingGarden: "Garden",
    seatingPrivate: "Private room",
    specialRequests: "Special requests",
    optional: "(optional)",
    specialRequestsPlaceholder: "Birthday, allergies, high chair…",
    checkingAvailability: "Checking availability…",
    available: "This time is available",
    notAvailable: "Not available",
    depositNotice: "A {amount} deposit is required to secure this booking.",
    signInToReserve: "Sign in to reserve",
    booking: "Booking…",
    confirmReservation: "Confirm your reservation",
    restaurant: "Restaurant",
    dateTime: "Date & time",
    guestsCount: "{count} guests",
    specialRequestsLabel: "Special requests",
    depositWillBeRequired: "A {amount} deposit will be required to secure this booking.",
    goBack: "Go back",
    confirmBooking: "Confirm booking",
    payDeposit: "Pay your deposit",
    tableReserved: "Table reserved!",
    scanToPay: "Scan with any KHQR-enabled banking app to pay ",
    payAtRestaurant: "Or pay via ABA · Wing · Bakong · ACLEDA at the restaurant",
    ivePaid: "I've paid",
    confirming: "Confirming…",
    simulatedDemo: "Simulated for this demo — no real payment gateway is connected.",
    sentToAccount: "We've sent this to your account. Show this check-in code when you arrive.",
    checkInCode: "Check-in code",
    done: "Done",
    couldntConfirmPayment: "Couldn't confirm payment, please try again."
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
    somethingWentWrong: "មានបញ្ហាមួយបានកើតឡើង",
    continueWithGoogle: "បន្តជាមួយ Google",
    googleUnavailable:
      "ការចូលដោយ Google មិនអាចប្រើបានទេនៅក្នុងកម្មវិធីរុករកនេះ សូមប្រើលេខទូរស័ព្ទរបស់អ្នកជំនួសវិញ។"
  },
  home: {
    heroTagline: "TableSite · កម្ពុជា",
    heroTitlePrefix: "រកតុរបស់អ្នកទូទាំង",
    heroTitleHighlight: "កម្ពុជា",
    heroSubtitle: "កក់តុល្អបំផុតរបស់កម្ពុជា — ពីរភាសា ពីររូបិយប័ណ្ណ ត្រៀមខ្លួនជាមួយ KHQR។",
    searchPlaceholder: "ស្វែងរកតាមឈ្មោះភោជនីយដ្ឋាន…",
    search: "ស្វែងរក",
    statRestaurants: "ភោជនីយដ្ឋាន",
    statProvinces: "ខេត្ត",
    statReady: "ត្រៀមរួចរាល់",
    browseByCuisine: "រកមើលតាមប្រភេទម្ហូប",
    popularRestaurants: "ភោជនីយដ្ឋានពេញនិយម",
    viewAll: "មើលទាំងអស់ →",
    emptyTitle: "បន្ទប់ទទួលទានកំពុងត្រៀមខ្លួន",
    emptyMessage: "មិនទាន់មានភោជនីយដ្ឋានបើកទ្វារនៅឡើយទេ — សូមត្រឡប់មកមើលម្តងទៀតឆាប់ៗនេះ។",
    ownerCtaTitle: "មានភោជនីយដ្ឋានផ្ទាល់ខ្លួន?",
    ownerCtaBody:
      "ដាក់ភោជនីយដ្ឋានរបស់អ្នកនៅលើ TableSite ហើយគ្រប់គ្រងការកក់ តុ និងម៉ឺនុយ ពីផ្ទាំងគ្រប់គ្រងតែមួយ។",
    ownerCtaButton: "បើកវិបផតថលម្ចាស់ភោជនីយដ្ឋាន"
  },
  cuisines: {
    khmer: "ខ្មែរ",
    seafood: "អាហារសមុទ្រ",
    bbqGrill: "អាំង",
    fineDining: "ភោជនីយដ្ឋានប្រណីត",
    cafe: "កាហ្វេ",
    streetFood: "អាហារតាមផ្លូវ"
  },
  bookingsPage: {
    title: "ការកក់របស់ខ្ញុំ",
    tabUpcoming: "នាពេលខាងមុខ",
    tabPast: "កន្លងមក",
    signInTitle: "ចូលគណនីដើម្បីមើលការកក់របស់អ្នក",
    signInMessage: "ចូលគណនីពីផ្នែកខាងលើដើម្បីមើល និងគ្រប់គ្រងការកក់របស់អ្នក។",
    loadError: "មិនអាចទាញយកការកក់របស់អ្នកបានទេ។",
    cancelError: "មិនអាចលុបចោលការកក់នេះបានទេ។",
    emptyPastTitle: "មិនមានការកក់កន្លងមក",
    emptyUpcomingTitle: "មិនមានការកក់នាពេលខាងមុខ",
    emptyMessage: "ស្វែងរកភោជនីយដ្ឋានដែលអ្នកចូលចិត្ត ហើយកក់តុ — វាចំណាយពេលតែមួយភ្លែត។",
    browseRestaurants: "រកមើលភោជនីយដ្ឋាន",
    confirmation: "លេខបញ្ជាក់ {code}",
    cancelBooking: "លុបចោលការកក់",
    cancelling: "កំពុងលុបចោល…",
    checkInCode: "លេខកូដចូលរួម",
    checkIn: "ចូលរួម",
    previous: "មុន",
    next: "បន្ទាប់",
    pageOf: "ទំព័រ {page} នៃ {total}",
    cancelModalTitle: "លុបចោលការកក់នេះឬ?",
    cancelModalBody: "សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
    keepBooking: "រក្សាទុកការកក់",
    guestsCount: "ភ្ញៀវ {count} នាក់",
    at: "នៅម៉ោង"
  },
  profilePage: {
    signInTitle: "ចូលគណនីដើម្បីមើលប្រវត្តិរូបរបស់អ្នក",
    signInMessage: "ចូលគណនីពីផ្នែកខាងលើដើម្បីគ្រប់គ្រងភោជនីយដ្ឋានដែលបានរក្សាទុក និងវិធីបង់ប្រាក់។",
    savedRestaurants: "ភោជនីយដ្ឋានដែលបានរក្សាទុក",
    loadSavedError: "មិនអាចទាញយកភោជនីយដ្ឋានដែលបានរក្សាទុកបានទេ។",
    emptySavedTitle: "មិនទាន់មានភោជនីយដ្ឋានដែលបានរក្សាទុកទេ",
    emptySavedMessage: "ចុចរូបបេះដូងលើភោជនីយដ្ឋានណាមួយដើម្បីរក្សាទុកនៅទីនេះ។",
    browseRestaurants: "រកមើលភោជនីយដ្ឋាន",
    remove: "លុបចេញ",
    paymentMethods: "វិធីបង់ប្រាក់",
    loadPaymentError: "មិនអាចទាញយកវិធីបង់ប្រាក់បានទេ។",
    addShort: "+ បន្ថែម",
    emptyPaymentTitle: "មិនទាន់មានវិធីបង់ប្រាក់ដែលបានរក្សាទុកទេ",
    emptyPaymentMessage: "បន្ថែមគណនីបង់ប្រាក់ចល័តដើម្បីទូទាត់លឿនជាងមុន។",
    default: "លំនាំដើម",
    removePaymentError: "មិនអាចលុបវិធីបង់ប្រាក់នេះបានទេ។",
    addPaymentMethod: "បន្ថែមវិធីបង់ប្រាក់",
    provider: "អ្នកផ្តល់សេវា",
    label: "ស្លាក",
    labelPlaceholder: "ឧ. ABA ផ្ទាល់ខ្លួន",
    detailOptional: "ព័ត៌មានលម្អិត (ស្រេចចិត្ត)",
    detailPlaceholder: "លេខគណនី ឬកំណត់ចំណាំ",
    setAsDefault: "កំណត់ជាលំនាំដើម",
    adding: "កំពុងបន្ថែម…",
    addPaymentMethodButton: "បន្ថែមវិធីបង់ប្រាក់"
  },
  searchPage: {
    title: "ស្វែងរកភោជនីយដ្ឋាន",
    restaurantName: "ឈ្មោះភោជនីយដ្ឋាន",
    restaurantNamePlaceholder: "ឧ. Malis",
    city: "ទីក្រុង",
    cityPlaceholder: "ឧ. ភ្នំពេញ",
    cuisine: "ប្រភេទម្ហូប",
    cuisinePlaceholder: "ឧ. ខ្មែរ",
    tag: "ស្លាក",
    anyTag: "ស្លាកណាមួយ",
    price: "តម្លៃ",
    any: "ណាមួយ",
    search: "ស្វែងរក",
    clear: "សម្អាត",
    resultsFound: "រកឃើញភោជនីយដ្ឋាន {count}",
    previous: "មុន",
    next: "បន្ទាប់",
    pageOf: "ទំព័រ {page} នៃ {total}",
    loadError: "មិនអាចទាញយកភោជនីយដ្ឋានបានទេ។ សូមព្យាយាមម្តងទៀត។",
    emptyTitle: "គ្មានតុត្រូវនឹងការស្វែងរកនោះទេ",
    emptyMessage:
      "សាកល្បងទីក្រុង ប្រភេទម្ហូបផ្សេង ឬសម្អាតតម្រង — កន្លែងសំណព្វថ្មីរបស់អ្នកនៅតែមាន។",
    clearFilters: "សម្អាតតម្រង"
  },
  restaurantPage: {
    dressCode: "លក្ខខណ្ឌសំលៀកបំពាក់",
    deposit: "ប្រាក់កក់",
    depositNotRequired: "មិនតម្រូវ",
    depositAmount: "{amount} ក្នុងមួយការកក់",
    cancellation: "លក្ខខណ្ឌលុបចោល",
    cancellationNotice: "ជូនដំណឹងមុន {hours} ម៉ោង",
    parking: "កន្លែងចតរថយន្ត",
    parkingAvailable: "មាន",
    hours: "ម៉ោងបើក",
    closed: "បិទ",
    menu: "ម៉ឺនុយ",
    gallery: "វិចិត្រសាល",
    days: {
      monday: "ថ្ងៃច័ន្ទ",
      tuesday: "ថ្ងៃអង្គារ",
      wednesday: "ថ្ងៃពុធ",
      thursday: "ថ្ងៃព្រហស្បតិ៍",
      friday: "ថ្ងៃសុក្រ",
      saturday: "ថ្ងៃសៅរ៍",
      sunday: "ថ្ងៃអាទិត្យ"
    }
  },
  bookingWidget: {
    reserveTable: "កក់តុ",
    date: "កាលបរិច្ឆេទ",
    partySize: "ចំនួនភ្ញៀវ",
    time: "ម៉ោង",
    closedOnDate: "បិទនៅថ្ងៃនេះ",
    closedOnDay: "បិទនៅថ្ងៃនេះ",
    seating: "កន្លែងអង្គុយ",
    seatingIndoor: "ក្នុងអាគារ",
    seatingGarden: "សួនច្បារ",
    seatingPrivate: "បន្ទប់ឯកជន",
    specialRequests: "សំណើពិសេស",
    optional: "(ស្រេចចិត្ត)",
    specialRequestsPlaceholder: "ថ្ងៃកំណើត អាឡែស៊ី កៅអីកុមារ…",
    checkingAvailability: "កំពុងពិនិត្យភាពទំនេរ…",
    available: "ម៉ោងនេះអាចកក់បាន",
    notAvailable: "មិនអាចកក់បានទេ",
    depositNotice: "ត្រូវការប្រាក់កក់ {amount} ដើម្បីធានាការកក់នេះ។",
    signInToReserve: "ចូលគណនីដើម្បីកក់",
    booking: "កំពុងកក់…",
    confirmReservation: "បញ្ជាក់ការកក់របស់អ្នក",
    restaurant: "ភោជនីយដ្ឋាន",
    dateTime: "កាលបរិច្ឆេទ និងម៉ោង",
    guestsCount: "ភ្ញៀវ {count} នាក់",
    specialRequestsLabel: "សំណើពិសេស",
    depositWillBeRequired: "ត្រូវការប្រាក់កក់ {amount} ដើម្បីធានាការកក់នេះ។",
    goBack: "ត្រឡប់ក្រោយ",
    confirmBooking: "បញ្ជាក់ការកក់",
    payDeposit: "បង់ប្រាក់កក់របស់អ្នក",
    tableReserved: "តុត្រូវបានកក់ជោគជ័យ!",
    scanToPay: "ស្កេនដោយកម្មវិធីធនាគារណាមួយដែលគាំទ្រ KHQR ដើម្បីបង់ ",
    payAtRestaurant: "ឬបង់តាម ABA · Wing · Bakong · ACLEDA នៅភោជនីយដ្ឋាន",
    ivePaid: "ខ្ញុំបានបង់ប្រាក់ហើយ",
    confirming: "កំពុងបញ្ជាក់…",
    simulatedDemo: "ត្រូវបានក្លែងធ្វើសម្រាប់ការសាកល្បងនេះ — មិនមានច្រកបង់ប្រាក់ពិតភ្ជាប់ទេ។",
    sentToAccount: "យើងបានផ្ញើវាទៅគណនីរបស់អ្នក។ បង្ហាញលេខកូដចូលរួមនេះនៅពេលអ្នកមកដល់។",
    checkInCode: "លេខកូដចូលរួម",
    done: "រួចរាល់",
    couldntConfirmPayment: "មិនអាចបញ្ជាក់ការបង់ប្រាក់បានទេ សូមព្យាយាមម្តងទៀត។"
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

export type TranslationParams = Record<string, string | number>;

export function getMessage(
  dictionary: Record<string, unknown>,
  key: TranslationKey,
  params?: TranslationParams
): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined),
      dictionary
    );
  const message = typeof value === "string" ? value : key;
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (match, token: string) =>
    token in params ? String(params[token]) : match
  );
}
