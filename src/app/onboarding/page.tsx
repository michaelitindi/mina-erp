'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/app/actions/onboarding'
import { ALL_MODULES, DEFAULT_MODULES, ModuleType } from '@/lib/modules'
import { Check, ArrowRight, Sparkles, Building2, Globe, Settings, ArrowLeft } from 'lucide-react'

const COUNTRIES = [
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪', timezone: 'Africa/Nairobi' },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸', timezone: 'America/New_York' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧', timezone: 'Europe/London' },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦', timezone: 'America/Toronto' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', flag: '🇿🇦', timezone: 'Africa/Johannesburg' },
  { code: 'DE', name: 'Germany (Eurozone)', currency: 'EUR', flag: '🇩🇪', timezone: 'Europe/Berlin' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪', timezone: 'Asia/Dubai' },
  { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳', timezone: 'Asia/Kolkata' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  
  // Step 1: Org Details
  const [orgName, setOrgName] = useState('')
  const [industry, setIndustry] = useState('Technology')
  
  // Step 2: Country Selection
  const [selectedCountryCode, setSelectedCountryCode] = useState('US')
  
  // Step 3: Modules
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>(DEFAULT_MODULES)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const currentCountry = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[1]

  const toggleModule = (moduleId: ModuleType) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    )
  }

  const handleNextStep = () => {
    setError('')
    if (step === 1) {
      if (!orgName.trim()) {
        setError('Please enter your organization name')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!selectedCountryCode) {
        setError('Please select a country')
        return
      }
      setStep(3)
    }
  }

  const handlePrevStep = () => {
    setError('')
    setStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = async () => {
    if (selectedModules.length === 0) {
      setError('Please select at least one module')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      await completeOnboarding({
        name: orgName,
        country: currentCountry.code,
        currency: currentCountry.currency,
        modules: selectedModules,
      })
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4 md:p-6 select-none">
      <div className="w-full max-w-3xl bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-10 max-w-md mx-auto relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-800 -z-10" />
          
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm transition-all duration-300 ${
            step >= 1 ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border-zinc-800 bg-zinc-900 text-zinc-500'
          }`}>
            1
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm transition-all duration-300 ${
            step >= 2 ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border-zinc-800 bg-zinc-900 text-zinc-500'
          }`}>
            2
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm transition-all duration-300 ${
            step >= 3 ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border-zinc-800 bg-zinc-900 text-zinc-500'
          }`}>
            3
          </div>
        </div>

        {/* Step 1: Organization Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
                <Building2 className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Configure Company Profile</h1>
              <p className="text-sm text-zinc-400">Let's start by naming your organization and defining your industry sector.</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-855/80 rounded-xl text-white placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Industry Sector</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-855/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                >
                  <option value="Technology">Technology & SaaS</option>
                  <option value="Manufacturing">Manufacturing & Assembly</option>
                  <option value="Retail">Retail & Point of Sale (POS)</option>
                  <option value="Logistics">Logistics & Supply Chain</option>
                  <option value="Financial">Professional Services & Consulting</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Regional/Country Settings */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20">
                <Globe className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Select Region & Localization</h1>
              <p className="text-sm text-zinc-400">Specify your home country. We will configure currency, timezone, and regional tax compliance standards dynamically.</p>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Country</label>
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-855/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview Card */}
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Localization Preview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-zinc-500">Base Currency</p>
                    <p className="font-semibold text-white mt-0.5">{currentCountry.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Base Timezone</p>
                    <p className="font-semibold text-white mt-0.5">{currentCountry.timezone}</p>
                  </div>
                </div>
                {currentCountry.code === 'KE' && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-400">
                    💡 **Kenya localization active**: Dynamic KRA eTIMS invoice generation, tax withholding, and local billing payment gateways will be enabled.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Module Customization */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                <Settings className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Enable ERP Modules</h1>
              <p className="text-sm text-zinc-400">Select the modular micro-consoles to configure for your dashboard. Unselected tools can be activated later in settings.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1">
              {ALL_MODULES.map(module => {
                const isSelected = selectedModules.includes(module.id)
                // Highlight eTIMS relevance for Kenya
                const isCompliance = module.id === 'FINANCE' && currentCountry.code === 'KE'

                return (
                  <button
                    key={module.id}
                    onClick={() => toggleModule(module.id)}
                    className={`
                      relative group p-4 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 transition-transform group-hover:scale-105 shadow-inner
                      ${isSelected ? 'bg-blue-500/20' : 'bg-zinc-800/50'}
                    `}>
                      {module.icon}
                    </div>
                    
                    <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                      {module.name}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {module.description}
                    </p>

                    {isCompliance && (
                      <span className="absolute bottom-2 right-2 text-[9px] bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold px-1.5 py-0.5 rounded-full">
                        eTIMS
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-center shadow-lg shadow-red-500/10 text-sm max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Actions Button Panel */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-zinc-850">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950 transition-all text-sm font-semibold cursor-pointer active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || selectedModules.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
