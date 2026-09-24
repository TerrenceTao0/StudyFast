import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

//

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

//

export const metadata: Metadata = {
  title: "StudyFast",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body
        className={`${nunito.className} min-h-full flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}

