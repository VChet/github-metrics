import { type Ref, ref } from "vue";
import { useEventListener } from "@vueuse/core";

export function useDialog(elementRef?: Ref<HTMLDialogElement | null>) {
  const element = elementRef ?? ref<HTMLDialogElement | null>(null);
  function open() {
    if (!element.value) return;
    element.value.showModal();
    document.body.classList.add("disable-scroll");
  }
  function close() {
    if (!element.value) return;
    element.value.close();
  }
  // Close on click outside
  useEventListener(element, "mousedown", (event) => {
    if (event.target === element.value) {
      element.value?.close();
      document.body.classList.remove("disable-scroll");
    }
  });

  return { element, open, close };
}
