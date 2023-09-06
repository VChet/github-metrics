import { useStorage } from "@vueuse/core";
import { Repository } from "@/classes/Repo";

type RepositoriesStore = {
  version: number;
  repositories: Repository[];
};

export const CURRENT_VERSION = 1;

export const storage = useStorage<RepositoriesStore>("repositories", {
  version: CURRENT_VERSION,
  repositories: []
});
