export const metadata = {
  title: "Terms and Conditions | CineTrake",
};

export default function TermsPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Legal
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Terms and Conditions
      </h1>
      <p className="mt-5 text-muted-foreground">Last updated: May 19, 2026</p>

      <div className="mt-10 space-y-8 text-base leading-8 text-muted-foreground">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Use of the Service
          </h2>
          <p className="mt-3">
            CineTrake helps users discover upcoming movies, save personal
            watchlists, vote on public interest, and discuss releases. You agree
            to use the service lawfully and respectfully.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Accounts
          </h2>
          <p className="mt-3">
            You are responsible for keeping your username and password secure.
            You may not impersonate others, automate abusive activity, or attempt
            to access another user’s private watchlist.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Comments and Community Features
          </h2>
          <p className="mt-3">
            Comments should stay relevant to movies and releases. We may remove
            content that is abusive, spammy, illegal, misleading, or otherwise
            harmful to the service or other users.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Third-Party Content
          </h2>
          <p className="mt-3">
            Movie metadata, artwork, credits, videos, and related public-interest
            data are provided through TMDB and embedded video providers. Those
            services may have their own terms and availability limits.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            No Guarantee
          </h2>
          <p className="mt-3">
            Release dates, trailers, cast details, popularity scores, and
            availability can change. CineTrake is provided as-is and may contain
            incomplete or outdated information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Changes
          </h2>
          <p className="mt-3">
            These terms may be updated as the app evolves, especially before any
            production launch, paid features, analytics, or advertising partners
            are enabled.
          </p>
        </section>
      </div>
    </section>
  );
}
