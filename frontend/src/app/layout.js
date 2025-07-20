import { AuthProvider } from '@/lib/auth-context'
import { NotificationProvider } from '@/lib/notification-context'
import { NotificationContainer } from '@/components/ui/Notification'
import '../styles/globals.css'

export const metadata = {
  title: '4syz Admin System',
  description: 'Role-based access control system for 4syz and client management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <NotificationContainer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 