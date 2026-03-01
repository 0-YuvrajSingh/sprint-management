import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AnchorHTMLAttributes, ReactElement, ReactNode } from "react";

interface RouterContextValue {
  path: string;
  navigate: (to: string, replace?: boolean) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);
const OutletContext = createContext<ReactNode>(null);

function useRouterContext(): RouterContextValue {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("Router primitives must be used within <BrowserRouter>.");
  }
  return context;
}

function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname || "/");

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const context = useMemo<RouterContextValue>(
    () => ({
      path,
      navigate: (to: string, replace = false) => {
        const normalized = normalizePath(to);
        if (replace) {
          window.history.replaceState({}, "", normalized);
        } else {
          window.history.pushState({}, "", normalized);
        }
        setPath(normalized);
      },
    }),
    [path],
  );

  return <RouterContext.Provider value={context}>{children}</RouterContext.Provider>;
}

type NavLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href"> & {
  to: string;
  className?: string | ((args: { isActive: boolean }) => string);
};

export function NavLink({ to, className, onClick, children, ...props }: NavLinkProps) {
  const { path, navigate } = useRouterContext();
  const target = normalizePath(to);
  const isActive = path === target;

  const resolvedClassName = typeof className === "function" ? className({ isActive }) : className;

  return (
    <a
      href={target}
      className={resolvedClassName}
      onClick={(event) => {
        event.preventDefault();
        navigate(target);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const { navigate } = useRouterContext();

  useEffect(() => {
    navigate(to, replace);
  }, [navigate, replace, to]);

  return null;
}

export function Route({}: { path?: string; index?: boolean; element: ReactElement; children?: ReactElement[] | ReactElement }) {
  return null;
}

interface MatchResult {
  element: ReactElement;
  outlet: ReactNode;
}

function matchRoute(path: string, route: ReactElement, basePath = ""): MatchResult | null {
  const routeProps = route.props as { path?: string; index?: boolean; element: ReactElement; children?: ReactNode };
  const fullPath = routeProps.path
    ? normalizePath(`${basePath}/${routeProps.path}`.replace(/\/+/g, "/"))
    : normalizePath(basePath || "/");

  if (routeProps.index && path === fullPath) {
    return { element: routeProps.element, outlet: null };
  }

  if (routeProps.path && path === fullPath) {
    return { element: routeProps.element, outlet: null };
  }

  const children = Array.isArray(routeProps.children)
    ? routeProps.children
    : routeProps.children
      ? [routeProps.children]
      : [];

  for (const child of children) {
    if (!child || typeof child !== "object") {
      continue;
    }

    const childMatch = matchRoute(path, child as ReactElement, fullPath);
    if (childMatch) {
      return { element: routeProps.element, outlet: childMatch.element };
    }
  }

  return null;
}

export function Routes({ children }: { children: ReactNode }) {
  const { path } = useRouterContext();
  const routes = Array.isArray(children) ? children : [children];

  for (const route of routes) {
    if (!route || typeof route !== "object") {
      continue;
    }

    const match = matchRoute(path, route as ReactElement);
    if (match) {
      return <OutletContext.Provider value={match.outlet}>{match.element}</OutletContext.Provider>;
    }
  }

  return null;
}

export function Outlet() {
  return <>{useContext(OutletContext)}</>;
}
