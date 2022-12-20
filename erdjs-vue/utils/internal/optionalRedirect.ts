import type { OnLoginRedirectOptionsType, OnProviderLoginType } from 'erdjs-vue/types';
import { safeRedirect } from '../redirect';

interface OptionalRedirectType extends Omit<OnProviderLoginType, 'token'> {
  options?: OnLoginRedirectOptionsType;
}

const DEFAULT_TIMEOUT = 200;

export function optionalRedirect({
  callbackRoute,
  onLoginRedirect,
  options
}: OptionalRedirectType) {
  const shouldRedirect = Boolean(callbackRoute);

  const hasOnLoginRedirect = typeof onLoginRedirect === 'function';

  const timeout = hasOnLoginRedirect ? 0 : DEFAULT_TIMEOUT;

  if (shouldRedirect && callbackRoute != null) {
    setTimeout(() => {
      // if onLoginRedirect is defined, it has priority over safeRedirect
      if (hasOnLoginRedirect) {
        return onLoginRedirect(callbackRoute, options);
      }
      if (!window.location.pathname.includes(callbackRoute)) {
        safeRedirect(callbackRoute);
      }
    }, timeout);
  }
}
