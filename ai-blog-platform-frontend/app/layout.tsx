import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import ErrorBoundary from '@/components/error-boundary'
import './globals.css'

export const metadata: Metadata = {
  title: 'ArticleScribe',
  description: 'AI Blog Builder with WordPress Deployment',
  generator: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle ChunkLoadError globally
              window.addEventListener('error', function(event) {
                if (event.error && (event.error.name === 'ChunkLoadError' ||
                    event.error.message.includes('Loading chunk') ||
                    event.error.message.includes('Loading CSS chunk'))) {
                  console.log('ChunkLoadError detected, reloading page...');
                  window.location.reload();
                }
              });

              // Handle unhandled promise rejections for chunk loading
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && (event.reason.name === 'ChunkLoadError' ||
                    event.reason.message.includes('Loading chunk') ||
                    event.reason.message.includes('Loading CSS chunk'))) {
                  console.log('ChunkLoadError in promise rejection, reloading page...');
                  event.preventDefault();
                  window.location.reload();
                }
              });
            `,
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
