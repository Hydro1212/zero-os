import { useGetSettings } from "./useQueries";
import { Settings } from "../backend";

export function useSettings() {
  const query = useGetSettings();
  return {
    ...query,
    data: query.data as Settings | undefined,
  };
}
