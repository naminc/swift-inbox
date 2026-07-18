import { useEffect } from "react";

import { usePublicSettings } from "@/hooks/use-public-settings";
import { applyDocumentMeta } from "@/lib/document-meta";
import { SITE_DEFAULTS } from "@/lib/site-defaults";

export function PublicSettingsMeta() {
  const { data } = usePublicSettings();

  useEffect(() => {
    applyDocumentMeta({
      description: data?.metaDescription || SITE_DEFAULTS.metaDescription,
      keywords: data?.metaKeywords || SITE_DEFAULTS.metaKeywords,
      author: data?.metaAuthor || SITE_DEFAULTS.metaAuthor,
    });
  }, [data]);

  return null;
}
