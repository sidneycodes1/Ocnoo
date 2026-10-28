import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBottomSpacer from "@/components/layout/MobileBottomSpacer";
import TabBar from "@/components/layout/TabBar";
import Footer from "@/components/layout/Footer";
import SellFab from "@/components/layout/SellFab";
import EventsTracker from "@/components/analytics/EventsTracker";
import { getPublishedProducts } from "@/lib/catalog";
import { CatalogProvider } from "@/context/CatalogProvider";
import { CartProvider } from "@/context/CartContext";
import { SavedProvider } from "@/context/SavedContext";
import { SellersProvider } from "@/context/SellersContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { AddressesProvider } from "@/context/AddressesContext";
import { ConnectionsProvider } from "@/context/ConnectionsContext";
import { ListingsProvider } from "@/context/ListingsContext";
import { SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Absolute base Next uses to resolve any relative URL in metadata. The
  // sitemap and robots build their own absolute URLs from SITE_URL, so this is
  // not what makes those work - it is what makes canonical/og URLs correct the
  // moment any route starts declaring one.
  metadataBase: new URL(SITE_URL),
  title: "OCNOO Online Store — Buy • Sell • Resell",
  description:
    "Quality Products. Great Prices. Delivered to You. Demo storefront for OCNOO Online Store.",
  // No openGraph.images on purpose: a product photo would only be right for one
  // route, and the catalogue is edited live from the admin panel.
};

// viewport-fit=cover is what makes the env(safe-area-inset-*) utilities in
// globals.css resolve to anything other than zero on a notched phone.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

// The catalogue is read from the shared database on every request, so a product
// published in the admin is on the shop page on the next click. The trade is a
// slightly slower first paint; for a demo with trivial traffic that is the
// right side of the bargain, and it removes any cache to purge between the two
// deployments.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  /** Intercepted product sheet. Empty on every other route. */
  modal: React.ReactNode;
}>) {
  // One read per request, shared by the page, the modal and every client island
  // that only stores product ids (cart, saved).
  const products = await getPublishedProducts();

  return (
    <html lang="en">
      <body className={inter.className}>
        <CatalogProvider products={products}>
          <CartProvider>
            <SavedProvider>
              {/* Sits beside SavedProvider rather than deeper down because it is
                  the same class of thing: a device-local preference list. */}
              <SellersProvider>
                <OrdersProvider>
                  <ProfileProvider>
                    <AddressesProvider>
                      <ConnectionsProvider>
                        <ListingsProvider>
                          <div className="flex min-h-screen flex-col">
                            {/* Desktop keeps the global brand header; mobile uses a
                                per-screen header derived from the route. Neither is
                                wrapped in a div: `sticky` travels only as far as its
                                containing block, and a `hidden md:block` wrapper is
                                exactly one header tall, so a header inside one could
                                never stick — it scrolled away with the page. Each
                                header now carries its own breakpoint class, the way
                                MobileHeader always has. */}
                            <Header />
                            <MobileHeader />
                            <main className="flex-1">{children}</main>
                            <Footer />
                            <MobileBottomSpacer />
                            <SellFab />
                            <TabBar />
                          </div>
                          {/* Rendered outside the page column: it is a fixed overlay,
                              and keeping it out of the flex container means it can
                              never take a flex slot when a sheet is open. */}
                          {modal}
                          {/* One anonymous page-view counter for every route. */}
                          <EventsTracker />
                        </ListingsProvider>
                      </ConnectionsProvider>
                    </AddressesProvider>
                  </ProfileProvider>
                </OrdersProvider>
              </SellersProvider>
            </SavedProvider>
          </CartProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
