import './globals.css';

export const metadata = {
  title: 'UdaanSetu — Innovation Lifecycle Platform',
  description: 'Research → Innovation → IPR → Support → Startup → Impact | SIH1608 Demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
