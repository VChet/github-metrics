import type { ShallowRef } from "vue";
import { useEventListener } from "@vueuse/core";

export function useDialog(elementRef: Readonly<ShallowRef<HTMLDialogElement | null>>) {
  function open(): void {
    if (!elementRef.value) return;
    elementRef.value.showModal();
    document.body.classList.add("disable-scroll");
  }
  function close(): void {
    if (!elementRef.value) return;
    elementRef.value.close();
    document.body.classList.remove("disable-scroll");
  }
  // Close on click outside
  useEventListener(elementRef, "mousedown", (event) => {
    if (event.target === elementRef.value) close();
  });

  return { open, close };
}
