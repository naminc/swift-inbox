function setMeta(name: string, content: string) {
  if (!content) return;

  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

export function applyDocumentMeta(input: {
  description: string;
  keywords: string;
  author: string;
}) {
  setMeta("description", input.description);
  setMeta("keywords", input.keywords);
  setMeta("author", input.author);
}
