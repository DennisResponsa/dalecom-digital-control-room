"use client";

import { useEffect } from "react";

const GITHUB_PAGES_ORIGIN = "https://dennisresponsa.github.io";

function currentRoute() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export default function GitHubPagesBridge() {
  useEffect(() => {
    if (window.parent === window) return;

    const notifyParent = () => {
      window.parent.postMessage({ type: "dalecom:navigation", route: currentRoute() }, GITHUB_PAGES_ORIGIN);
    };
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = (...args) => {
      originalPushState(...args);
      window.setTimeout(notifyParent, 0);
    };
    window.history.replaceState = (...args) => {
      originalReplaceState(...args);
      window.setTimeout(notifyParent, 0);
    };

    const receiveNavigation = (event: MessageEvent) => {
      if (event.origin !== GITHUB_PAGES_ORIGIN || event.data?.type !== "dalecom:open") return;
      const route = typeof event.data.route === "string" ? event.data.route : "/demo";
      if (!route.startsWith("/") || route.startsWith("//")) return;
      window.location.assign(route);
    };

    window.addEventListener("popstate", notifyParent);
    window.addEventListener("message", receiveNavigation);
    notifyParent();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", notifyParent);
      window.removeEventListener("message", receiveNavigation);
    };
  }, []);

  return null;
}
