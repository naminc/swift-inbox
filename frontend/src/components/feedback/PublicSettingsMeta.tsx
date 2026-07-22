import { useEffect } from "react";

import { usePublicSettings } from "@/hooks/use-public-settings";
import { applyDocumentMeta } from "@/lib/document-meta";
import { SITE_DEFAULTS, SITE_URL } from "@/lib/site-defaults";

export function PublicSettingsMeta() {
  const { data } = usePublicSettings();

  useEffect(() => {
    applyDocumentMeta({
      siteName: data?.siteName || SITE_DEFAULTS.siteName,
      siteTitle: data?.siteTitle || SITE_DEFAULTS.siteTitle,
      description: data?.metaDescription || SITE_DEFAULTS.metaDescription,
      keywords: data?.metaKeywords || SITE_DEFAULTS.metaKeywords,
      author: data?.metaAuthor || SITE_DEFAULTS.metaAuthor,
      url: SITE_URL,
    });
  }, [data]);

  return null;
}
