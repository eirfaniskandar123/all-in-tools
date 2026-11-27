import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of Use · Icon Refactor" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        These terms apply to your use of Icon Refactor (&quot;the Service&quot;), an open-source tool by the All-in
        Tools project. By using the Service you agree to these terms. If you do not agree, do not use it.
      </p>

      <section>
        <h2>1. What the Service does</h2>
        <p>
          Icon Refactor converts an image you choose into icon files (resizing, format conversion and compression). All
          processing happens in your own web browser. Your images are not uploaded to or stored on our servers. See the{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>2. Your content and responsibility</h2>
        <ul>
          <li>
            You keep all rights to the images you use and the files you generate. We claim no ownership of them.
          </li>
          <li>
            You must only use images you own or have permission to use. You are responsible for making sure your use,
            including any logos, trademarks or brand assets, does not infringe anyone else&apos;s rights.
          </li>
          <li>You must not use the Service for anything unlawful, harmful or misleading.</li>
        </ul>
      </section>

      <section>
        <h2>3. Acceptable use</h2>
        <p>
          Do not attempt to disrupt, overload or gain unauthorised access to the Service or its hosting infrastructure,
          or use automated means to access it in a way that degrades it for others.
        </p>
      </section>

      <section>
        <h2>4. Open-source licence</h2>
        <p>
          The source code is released under the MIT License. Third-party components are used under their own licences
          (MIT, ISC), listed in <code>THIRD_PARTY_NOTICES.md</code> in the project repository.
        </p>
      </section>

      <section>
        <h2>5. Trademarks</h2>
        <p>
          Apple, iOS, iPadOS and Xcode are trademarks of Apple Inc. Android and Google Play are trademarks of Google LLC.
          Other names may be trademarks of their respective owners. Icon Refactor is not affiliated with, endorsed or
          sponsored by any of them. Platform names are used only to describe compatibility.
        </p>
      </section>

      <section>
        <h2>6. No warranty</h2>
        <p>
          The Service is provided <strong>&quot;as is&quot; and &quot;as available&quot;</strong>, without warranties of
          any kind, express or implied, including fitness for a particular purpose, accuracy or non-infringement. Platform
          requirements (for example App Store or Google Play icon rules) change over time. Always check generated files
          against the current official guidelines before publishing.
        </p>
      </section>

      <section>
        <h2>7. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, the All-in Tools project and its contributors are not liable for any
          indirect, incidental or consequential damages, or for any loss of data, revenue or business, arising from your
          use of or inability to use the Service or the files it produces.
        </p>
      </section>

      <section>
        <h2>8. Changes</h2>
        <p>
          We may update the Service or these terms at any time. The &quot;Last updated&quot; date shows the latest
          version. Continued use after a change means you accept the updated terms.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>Questions about these terms can be raised with the All-in Tools team through the project repository.</p>
      </section>
    </LegalPage>
  );
}
