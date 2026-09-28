import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

interface SheetState {
  sheetPushed?: boolean;
}

/**
 * Sheets live in the URL (`?sheet=add`), so the browser back button closes the sheet instead of
 * leaving the page, and a refresh keeps it open.
 */
export function useSheetParam() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const pushed = (location.state as SheetState | null)?.sheetPushed === true;

  const openSheet = useCallback(
    (name: string, extra: Record<string, string> = {}) => {
      const search = new URLSearchParams({ sheet: name, ...extra }).toString();
      navigate({ pathname: location.pathname, search }, { state: { sheetPushed: true } });
    },
    [navigate, location.pathname],
  );

  const closeSheet = useCallback(() => {
    if (pushed) navigate(-1);
    else navigate({ pathname: location.pathname, search: '' }, { replace: true });
  }, [navigate, pushed, location.pathname]);

  return { sheet: params.get('sheet'), params, openSheet, closeSheet };
}
