import { computed, toValue, type MaybeRefOrGetter } from "vue";

export interface TextPart {
  text: string
  highlighted: boolean
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function useHighlightedText(text: MaybeRefOrGetter<string>, query: MaybeRefOrGetter<string>) {
  return computed<TextPart[]>(() => {
    const source = toValue(text);
    const search = toValue(query);

    if (!search) return [{ text: source, highlighted: false }];

    const regexp = new RegExp(`(${escapeRegExp(search)})`, "i");
    return source
      .split(regexp)
      .filter(Boolean)
      .map((part) => ({ text: part, highlighted: regexp.test(part) }));
  });
}
