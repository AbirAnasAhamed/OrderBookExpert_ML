import { ScraperControl } from "@/components/features/scraper/ScraperControl"

export default function ScraperPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Scraper</h2>
        <p className="text-muted-foreground">
          Collect real-time L2 order book data from exchanges to train the ML model.
        </p>
      </div>
      <ScraperControl />
    </div>
  )
}
