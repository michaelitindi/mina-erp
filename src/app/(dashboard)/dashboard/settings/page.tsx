import Link from 'next/link'
import { Shield, CreditCard, Settings, Building2, Users, Bell } from 'lucide-react'

export default function SettingsPage() {
  const categories = [
    {
      title: 'Compliance & Tax',
      items: [
        { 
          name: 'eTIMS Configuration', 
          description: 'Manage KRA device credentials and tax settings',
          href: '/dashboard/settings/etims',
          icon: Shield,
          color: 'text-blue-400 bg-blue-400/10'
        },
      ]
    },
    {
      title: 'Payments & Integration',
      items: [
        { 
          name: 'Payment Providers', 
          description: 'Configure M-Pesa, Stripe, and other gateways',
          href: '/dashboard/settings/payments',
          icon: CreditCard,
          color: 'text-purple-400 bg-purple-400/10'
        },
      ]
    },
    {
      title: 'Organization',
      items: [
        { 
          name: 'Profile', 
          description: 'Company name, logo, and general details',
          href: '#',
          icon: Building2,
          color: 'text-zinc-400 bg-zinc-400/10'
        },
        { 
          name: 'Team & Roles', 
          description: 'Manage user permissions and invitations',
          href: '#',
          icon: Users,
          color: 'text-zinc-400 bg-zinc-400/10'
        },
        { 
          name: 'Notifications', 
          description: 'Email and system alert preferences',
          href: '#',
          icon: Bell,
          color: 'text-zinc-400 bg-zinc-400/10'
        },
      ]
    }
  ]

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500">Global configuration for your organization</p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.title}>
            <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 ml-1">{category.title}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {category.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-start gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all shadow-sm backdrop-blur-sm"
                >
                  <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</h3>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
