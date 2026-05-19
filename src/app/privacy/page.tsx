export const metadata = {
  title: "Privacy Policy | CineTrake",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Legal
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Privacy Policy
      </h1>
      <p className="mt-5 text-muted-foreground">Last updated: May 19, 2026</p>

      <div className="mt-10 space-y-8 text-base leading-8 text-muted-foreground">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            What We Collect
          </h2>
          <p className="mt-3">
            CineTrake stores the username you create, a securely hashed password,
            your active login session, movies you save to your watchlist, hype or
            unhype votes, and comments you post on movie pages.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            How We Use Data
          </h2>
          <p className="mt-3">
            We use your data to authenticate your account, keep your personal
            watchlist private, count community hype votes, display comments, and
            improve the product experience. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Movie Data
          </h2>
          <p className="mt-3">
            Movie titles, posters, release dates, cast, trailers, genres, and
            descriptions are provided by TMDB. CineTrake is not endorsed or
            certified by TMDB.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Cookies
          </h2>
          <p className="mt-3">
            We use an HTTP-only session cookie to keep you logged in. This cookie
            is required for account features like watchlists, voting, and comments.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Ads
          </h2>
          <p className="mt-3">
            The app includes advertising placeholders. If advertising partners
            are added later, those partners may use their own cookies or
            measurement tools, and this policy should be updated before launch.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Data Removal
          </h2>
          <p className="mt-3">
            Users may request deletion of their account, watchlist, votes, and
            comments by contacting the site operator. Deleted data may remain in
            backups for a limited period.
          </p>
        </section>
      </div>
    </section>
  );
}
