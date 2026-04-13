import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { 
  ArrowRight, 
  BarChart3, 
  DollarSign, 
  Package, 
  Users,
  Shield,
  Zap,
  Globe,
  MessageSquare,
  Map,
} from 'lucide-react'

export default async function HomePage() {
  const { userId, orgId } = await auth()
  
  // If user is logged in and has an org, redirect to dashboard
  if (userId && orgId) {
    redirect('/dashboard')
  }

  const features = [
    {
      icon: DollarSign,
      title: 'Finance & Accounting',
      description: 'Complete double-entry bookkeeping, invoicing, and financial reporting.',
    },
    {
      icon: Users,
      title: 'CRM',
      description: 'Manage customers, leads, opportunities, and sales pipeline.',
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track stock levels, warehouses, and inventory movements.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Reporting',
      description: 'Real-time dashboards and customizable business reports.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Role-based access control, audit trails, and data encryption.',
    },
    {
      icon: Globe,
      title: 'Multi-Tenant',
      description: 'Isolated data per organization with full team collaboration.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <span className="text-xl font-semibold text-white">MinaERP</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/feedback"
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Feedback
              </Link>
              <Link
                href="/roadmap"
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Map className="h-4 w-4" />
                Roadmap
              </Link>
              <Link
                href="/sign-in"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Enterprise Resource Planning
              <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
              MinaERP is a comprehensive multi-tenant SaaS platform designed to manage all aspects 
              of your business operations including finance, HR, inventory, sales, and more.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-3 text-base font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Everything You Need</h2>
            <p className="mt-4 text-lg text-zinc-400">
              Comprehensive modules to run your entire business
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-12 shadow-2xl shadow-blue-600/20">
            <div className="text-center">
              <Zap className="mx-auto h-12 w-12 text-white" />
              <h2 className="mt-4 text-3xl font-bold text-white">Ready to Get Started?</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
                Join thousands of businesses already using MinaERP to streamline their operations.
              </p>
              <Link
                href="/sign-up"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors shadow-lg"
              >
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-500">
            © {new Date().getFullYear()} MinaERP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
