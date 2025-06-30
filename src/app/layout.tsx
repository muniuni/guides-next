// This file is required as the root layout in the app directory.
// It should only contain the minimum structure needed for Next.js.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
