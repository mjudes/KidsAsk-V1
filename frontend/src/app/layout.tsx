import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { AuthProvider } from '../utils/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'KidsAsk.ai - Ask Questions, Get Kid-Friendly Answers',
  description: 'A safe place for kids to ask questions and learn about animals, space, dinosaurs, and more!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
