import { type Ref, ref } from "vue";
import { useEventListener } from "@vueuse/core";

export function useDialog(elementRef?: Ref<HTMLDialogElement>) {
  const element = elementRef ?? ref<HTMLDialogElement>();
  function open(): void {
    if (!element.value) return;
    element.value.showModal();
    document.body.classList.add("disable-scroll");
  }
  function close(): void {
    if (!element.value) return;
    element.value.close();
    document.body.classList.remove("disable-scroll");
  }
  // Close on click outside
  useEventListener(element, "mousedown", (event) => {
    if (event.target === element.value) close();
  });

  return { element, open, close };
}
