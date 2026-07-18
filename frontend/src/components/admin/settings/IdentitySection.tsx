import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { SettingsSectionProps } from "./types";

export function IdentitySection({ settings, setSettings }: SettingsSectionProps) {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-sm font-semibold">Public identity</h2>
        <p className="text-xs text-muted-foreground">
          Branding and metadata shown on the public site and in search results.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="site-name">Site name</Label>
          <Input
            id="site-name"
            value={settings.siteName}
            maxLength={80}
            className="h-8 text-sm"
            onChange={(event) => setSettings((prev) => ({ ...prev, siteName: event.target.value }))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="support-email">Support email</Label>
          <Input
            id="support-email"
            type="email"
            value={settings.supportEmail}
            className="h-8 text-sm"
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, supportEmail: event.target.value }))
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="site-title">Site title</Label>
          <Input
            id="site-title"
            value={settings.siteTitle}
            maxLength={120}
            className="h-8 text-sm"
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, siteTitle: event.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Browser tab title, e.g. &quot;Swift Inbox - Free Temporary Email&quot;.{" "}
            {settings.siteTitle.trim().length}/120
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="meta-author">Meta author</Label>
          <Input
            id="meta-author"
            value={settings.metaAuthor}
            maxLength={80}
            className="h-8 text-sm"
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, metaAuthor: event.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Shown in the footer as &quot;Developed by&quot;. {settings.metaAuthor.trim().length}/80
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="hero-heading">Home hero heading</Label>
        <Input
          id="hero-heading"
          value={settings.heroHeading}
          maxLength={120}
          className="h-8 text-sm"
          onChange={(event) =>
            setSettings((prev) => ({ ...prev, heroHeading: event.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Large heading on the Home page, e.g. &quot;Free Temporary Email&quot;.{" "}
          {settings.heroHeading.trim().length}/120
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="hero-subheading">Home hero subheading</Label>
        <Input
          id="hero-subheading"
          value={settings.heroSubheading}
          maxLength={180}
          className="h-8 text-sm"
          onChange={(event) =>
            setSettings((prev) => ({ ...prev, heroSubheading: event.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Line under the hero heading. {settings.heroSubheading.trim().length}/180
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="meta-keywords">Meta keywords</Label>
        <Input
          id="meta-keywords"
          value={settings.metaKeywords}
          maxLength={300}
          className="h-8 text-sm"
          onChange={(event) =>
            setSettings((prev) => ({ ...prev, metaKeywords: event.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated keywords for SEO. {settings.metaKeywords.trim().length}/300
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="meta-description">Meta description</Label>
        <Textarea
          id="meta-description"
          value={settings.metaDescription}
          maxLength={300}
          className="min-h-20 resize-none text-sm"
          onChange={(event) =>
            setSettings((prev) => ({ ...prev, metaDescription: event.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Used in the search result snippet. {settings.metaDescription.trim().length}/300
        </p>
      </div>
    </section>
  );
}
