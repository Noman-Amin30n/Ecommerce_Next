import { useEffect, startTransition } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

function useSetCookie<T>(
  callback: () => Promise<void>,
  state?: T,
  router?: AppRouterInstance
) {
  return useEffect(() => {
    startTransition(async () => {
      await callback();
      if (router) {
        router.refresh();
      }
    });
  }, [state, router, callback]);
}

export default useSetCookie;
