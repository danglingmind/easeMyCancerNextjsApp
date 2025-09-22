import Link from "next/link"
import Image from "next/image"
import { HeartPulse, Brain, Salad, Flower2, Users, Calendar, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F1F5F2]">
      {/* Header */}
      <header className="bg-[#F1F5F2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Ease My Cancer" width={200} height={48} />
            </div>
            <div className="hidden gap-8 text-sm text-[color:var(--primary-strong)] sm:flex">
              <Link href="#services" className="hover:text-[color:var(--card-foreground)]">Services</Link>
              <Link href="#team" className="hover:text-[color:var(--card-foreground)]">Team</Link>
              <Link href="#contact" className="hover:text-[color:var(--card-foreground)]">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="text-[color:var(--muted-foreground)] hover:text-[color:var(--card-foreground)]">Log in</Link>
              <Link href="/sign-up" className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90">Join Program</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-16">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold leading-tight text-[color:var(--primary-strong)] sm:text-5xl">
                Transform Your
                <span className="block text-[color:var(--primary-strong)]">Body and Mind</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-[color:var(--muted-foreground)]">
                Holistic rehabilitation for cancer patients with yoga therapy, oncology counseling,
                and personalized nutrition care—delivered with compassion.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/sign-up" className="rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm font-semibold text-[color:var(--primary-foreground)] hover:opacity-90">Join Member</Link>
                <Link href="#services" className="rounded-full border border-[color:var(--primary-strong)]/50 px-6 py-3 text-sm font-semibold text-[color:var(--primary-strong)] hover:bg-white">Explore Services</Link>
              </div>
            </div>
            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-[color:var(--muted)] sm:h-96">
              <Image
                src="/wellness-hero.jpg"
                alt="Meditative yoga session in calming studio"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Stats band */}
        <section className="bg-[color:var(--card-foreground)] py-10 text-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
            <div>
              <div className="text-2xl font-semibold">3.2K</div>
              <div className="text-sm text-white/90">Yoga sessions completed</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">1.8K</div>
              <div className="text-sm text-white/90">Nutrition plans delivered</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">4.5M</div>
              <div className="text-sm text-white/90">Mindfulness minutes</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">98%</div>
              <div className="text-sm text-white/90">Patient satisfaction</div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#0F2E1D]">Our Services</h2>
            <p className="mt-3 max-w-2xl text-[#3B5E48]">
              Evidence-based programs designed for healing at every stage of the journey.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              icon={<Flower2 className="h-6 w-6 text-[#1F5F3A]" />}
              title="Therapeutic Yoga"
              description="Gentle to advanced yoga tailored for recovery—Hatha, Yin, Restorative."
            />
            <ServiceCard
              icon={<Brain className="h-6 w-6 text-[#1F5F3A]" />}
              title="Oncology Counseling"
              description="1:1 sessions for mental peace, stress management, and resilience."
            />
            <ServiceCard
              icon={<Salad className="h-6 w-6 text-[#1F5F3A]" />}
              title="Nutrition Care"
              description="Personalized diet plans for treatment phases and recovery."
            />
            <ServiceCard
              icon={<Users className="h-6 w-6 text-[#1F5F3A]" />}
              title="Support Circles"
              description="Group workshops and community programs for patients and families."
            />
            <ServiceCard
              icon={<Calendar className="h-6 w-6 text-[#1F5F3A]" />}
              title="Care Scheduling"
              description="Seamless bookings for classes, consultations, and follow-ups."
            />
            <ServiceCard
              icon={<ShieldCheck className="h-6 w-6 text-[#1F5F3A]" />}
              title="Safe & Secure"
              description="Privacy-first platform with role-based access and protected data."
            />
          </div>
        </section>

        {/* Team */}
        <section id="team" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#0F2E1D]">Meet Our Team</h2>
            <p className="mt-3 max-w-2xl text-[#3B5E48]">
              Certified yoga therapists, clinical nutritionists, and oncology counselors.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-white shadow">
                <div className="relative h-48 w-full bg-[#E7EFEA]">
                  <Image src={`/team-${i + 1}.jpg`} alt="Team member" fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="font-semibold text-[#0F2E1D]">Specialist {i + 1}</div>
                  <div className="text-sm text-[#3B5E48]">Wellness Expert</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-[#123D28] p-10 text-center text-white">
              <h3 className="text-3xl font-bold">Start your healing journey</h3>
              <p className="mx-auto mt-2 max-w-2xl text-white/80">
                Join our program to access personalized care plans, classes, and resources.
              </p>
              <div className="mt-6">
                <Link href="/sign-up" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#123D28] hover:bg-[#F1F5F2]">
                  Join Member
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#F1F5F2]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-[color:var(--muted-foreground)]">
              © {new Date().getFullYear()} Ease My Cancer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ServiceCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E7EFEA]">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#0F2E1D]">{title}</h3>
      <p className="mt-2 text-[#3B5E48]">{description}</p>
      <div className="mt-4 text-sm font-medium text-[#1F5F3A]">View more →</div>
    </div>
  )
}
