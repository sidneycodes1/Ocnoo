import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBottomSpacer from "@/components/layout/MobileBottomSpacer";
import TabBar from "@/components/layout/TabBar";
import Footer from "@/components/layout/Footer";
import SellFab from "@/components/layout/SellFab";
import { CartProvider } from "@/context/CartContext";
import { SavedProvider } from "@/context/SavedContext";
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
  // No openGraph.images on purpose: the catalogue has no real photographs yet,
  // and pointing a preview at a placeholder would be worse than no preview.
};

// viewport-fit=cover is what makes the env(safe-area-inset-*) utilities in
// globals.css resolve to anything other than zero on a notched phone.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  /** Intercepted product sheet. Empty on every other route. */
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <SavedProvider>
            <OrdersProvider>
              <ProfileProvider>
                <AddressesProvider>
                  <ConnectionsProvider>
                    <ListingsProvider>
                      <div className="flex min-h-screen flex-col">
                        {/* Desktop keeps the global brand header; mobile uses a
                            per-screen header derived from the route. */}
                        <div className="hidden md:block">
                          <Header />
                        </div>
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
                    </ListingsProvider>
                  </ConnectionsProvider>
                </AddressesProvider>
              </ProfileProvider>
            </OrdersProvider>
          </SavedProvider>
        </CartProvider>
      </body>
    </html>
  );
}
