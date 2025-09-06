import { defineStore } from "pinia";
import { ref } from "vue";

export const useSnackbarStore = defineStore("snackbar", () => {
  const snackbar = ref(false);
  const message = ref("");
  const color = ref("error");

  function show(msg: string, type: string = "error") {
    message.value = msg;
    color.value = type;
    snackbar.value = true;
  }

  function clear() {
    snackbar.value = false;
    message.value = "";
    color.value = "error";
  }

  return { snackbar, message, color, show, clear };
});
