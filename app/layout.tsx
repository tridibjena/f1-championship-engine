import type { Metadata } from "next";
import "./globals.css";
import { RootLayout } from "@/components/layout/RootLayout";

export const metadata: Metadata = {
  title: "F1 2026 — Championship Engine",
  description: "Production-grade F1 race prediction platform powered by Glicko-2, Bayesian priors, and Monte Carlo simulation.",
  keywords: ["F1", "Formula 1", "Championship", "Prediction", "Machine Learning", "Monte Carlo", "Glicko"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
