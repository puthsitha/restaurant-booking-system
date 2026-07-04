import { HomeHero } from "@/components/home/HomeHero";
import { HomePageContent } from "@/components/home/HomePageContent";
import { listRestaurants } from "@/lib/restaurants/api";

export default async function HomePage() {
  const { items } = await listRestaurants({ pageSize: 8 }).catch(() => ({
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
