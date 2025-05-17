import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Digital Products Marketplace",
  description: "Your one-stop shop for digital products",
};

// Error handling component
function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Something went wrong
        </h2>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-sm text-gray-600 bg-gray-100 p-4 rounded-md text-left">
            <p className="font-semibold">Error details:</p>
            <p className="mt-2 font-mono">{error.message}</p>
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    return (
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <AuthProvider>
            <Header />
            <main>{children}</main>
          </AuthProvider>
        </body>
      </html>
    );
  } catch (error: any) {
    console.error('Root layout error:', error);
    return (
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <ErrorDisplay error={error} />
        </body>
      </html>
    );
  }
}
