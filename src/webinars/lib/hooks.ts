"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux/store";
import * as api from "./api";
import type { WebinarRegistration } from "./types";

/** true after the first client render — avoids SSR/client time mismatches. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** Current time, refreshed every `ms`. Returns 0 until mounted. */
export function useNow(ms = 30_000) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/** Logged-in user from the existing auth slice (null until mounted). */
export function useCurrentUser() {
  const user = useSelector((s: RootState) => s.auth.user);
  const mounted = useMounted();
  return mounted ? user : null;
}

/** Registrations for the current user (or guest), kept in sync across tabs. */
export function useMyRegistrations() {
  const user = useCurrentUser();
  const [list, setList] = useState<WebinarRegistration[]>([]);
  useEffect(() => {
    const who = user ? { id: user.id, email: user.email } : null;
    const load = () => setList(api.myRegistrations(who));
    load();
    return api.subscribe(load);
  }, [user]);
  return list;
}

export function useRegistration(webinarId: string | undefined) {
  const list = useMyRegistrations();
  return webinarId ? list.find((r) => r.webinarId === webinarId) ?? null : null;
}
