import Header from "@/components/Header";
import "./globals.css";

export const metadata = {
  title: "PDF to Markdown with GPT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
