import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy · Icon Refactor" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        Icon Refactor is designed so that your images never leave your device. This policy explains what that means and
        the small amount of data involved in running the website.
      </p>

      <section>
        <h2>1. Your images</h2>
        <ul>
          <li>
            Images you open are processed <strong>entirely inside your browser</strong> using standard web APIs (Canvas).
          </li>
          <li>They are <strong>not uploaded</strong> to any server, and we cannot see, store or share them.</li>
          <li>Generated icons and the ZIP file are created on your device and saved directly to it.</li>
        </ul>
      </section>

      <section>
        <h2>2. Data stored on your device</h2>
        <p>
          The &quot;Recent files&quot; feature keeps up to 5 of your recent images (under 1.5 MB each) in your
          browser&apos;s local storage, so you can reopen them. This data stays on your device. You can remove it at any
          time by clearing this site&apos;s data in your browser settings. We do not use cookies.
        </p>
      </section>

      <section>
        <h2>3. No tracking</h2>
        <p>
          The Service has no analytics, advertising or tracking scripts, and does not load third-party resources. A
          strict Content Security Policy blocks connections to other websites.
        </p>
      </section>

      <section>
        <h2>4. Hosting</h2>
        <p>
          The website is hosted by Vercel Inc. Like any web host, Vercel processes basic technical data needed to deliver
          the page, such as your IP address, browser type and request time, for security and operations. This data is
          handled under{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            Vercel&apos;s Privacy Policy
          </a>
          . We do not combine it with any other information.
        </p>
      </section>

      <section>
        <h2>5. Children</h2>
        <p>The Service does not knowingly collect any personal information from anyone, including children.</p>
      </section>

      <section>
        <h2>6. Changes and contact</h2>
        <p>
          If this policy changes, the &quot;Last updated&quot; date above will change. Questions can be raised with the
          All-in Tools team through the project repository.
        </p>
      </section>
    </LegalPage>
  );
}
