function setNamedMeta(name: string, content: string) {
  if (!content) return;

  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setPropertyMeta(property: string, content: string) {
  if (!content) return;

  let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setCanonical(url: string) {
  if (!url) return;

  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", url);
}

export function applyDocumentMeta(input: {
  siteName: string;
  siteTitle: string;
  description: string;
  keywords: string;
  author: string;
  url: string;
}) {
  setNamedMeta("description", input.description);
  setNamedMeta("keywords", input.keywords);
  setNamedMeta("author", input.author);
  setNamedMeta("twitter:card", "summary");
  setNamedMeta("twitter:title", input.siteTitle);
  setNamedMeta("twitter:description", input.description);

  setPropertyMeta("og:title", input.siteTitle);
  setPropertyMeta("og:description", input.description);
  setPropertyMeta("og:site_name", input.siteName);
  setPropertyMeta("og:url", input.url);
  setPropertyMeta("og:type", "website");

  setCanonical(input.url);
}
