import { HomeHero } from "@/components/home/HomeHero";
import { HomePageContent } from "@/components/home/HomePageContent";
import { theme } from "@/lib/theme";
import { listRestaurants } from "@/lib/restaurants/api";

export default async function HomePage() {
  // Server-rendered, so the user's stored locale preference (client-only,
  // in localStorage) isn't known yet — match the UI shell's own default
  // language until hydration; the language toggle only affects client fetches.
  const { items } = await listRestaurants({ pageSize: 8 }, theme.defaultLocale).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 8,
  }));

  return (
    <main>
      <HomeHero />
      <HomePageContent items={items} />
    </main>
  );
}
