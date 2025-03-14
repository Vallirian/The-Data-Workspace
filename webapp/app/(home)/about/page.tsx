import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">We Know Data Shouldn't Be This Hard</h1>

            <div className="prose prose-lg max-w-none">
              <h2>Who We Are</h2>
              <p>
                I am a data scientist and a business analyst who've spent years helping companies make sense of their
                data. I've seen firsthand how much time and resources are wasted on repetitive cleaning tasks and
                complex analyses that don't lead to clear decisions.
              </p>

              <h2>Why We Started TheDataWorkspace</h2>
              <p>
                We built TheDataWorkspace because we believe data-driven decisions shouldn't require a technical degree.
                By combining the power of AI with intuitive workflows, we've created a solution that eliminates the
                frustration and delivers the insights.
              </p>

              <h2>Our Mission</h2>
              <p>
                Our mission is to democratize data analysis for business users. We want to empower every team member to
                contribute to data-driven decisions without the technical barriers that typically exist.
              </p>
            </div>

            <div className="mt-12">
              <Button asChild size="lg">
                <Link href="/get-started">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

