"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Accessibility,
  Armchair,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BusFront,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  CornerDownRight,
  Flag,
  Footprints,
  Timer,
  History as HistoryIcon,
  Info,
  Lightbulb,
  MapPin,
  Moon,
  Navigation,
  PersonStanding,
  Route,
  Search,
  Snowflake,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Users,
  Wind,
  X,
} from "lucide-react";
import {
  findTrip,
  findTrips,
  formatClock,
  formatDuration,
  parseClock,
  POPULAR_JOURNEYS,
  resolveStop,
  STOPS,
  type BusTrip,
  type ServiceType,
} from "@/lib/timetables";

type View = "upcoming" | "all";
type TypeFilter = "all" | ServiceType;
type Journey = { from: string; to: string; time: string };

function kolkataTime(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = parts.find((part) => part.type === "hour")?.value ?? "08";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

function toClock24(totalMinutes: number): string {
  const minutesInDay = ((totalMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(minutesInDay / 60)).padStart(2, "0")}:${String(minutesInDay % 60).padStart(2, "0")}`;
}

function kolkataDate(): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

function StopField({
  id,
  label,
  value,
  onChange,
  error,
  destination = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  destination?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    return STOPS.filter((stop) => stop.toLowerCase().includes(query)).slice(0, 7);
  }, [value]);

  function select(stop: string) {
    onChange(stop);
    setOpen(false);
    setActiveIndex(0);
  }

  return (
    <div
      className={`stop-field ${error ? "has-error" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className="field-shell">
        <span className={`field-marker ${destination ? "destination" : "origin"}`} aria-hidden="true">
          <MapPin size={19} strokeWidth={2.3} />
        </span>
        <div className="field-content">
          <label htmlFor={id}>{label}</label>
          <input
            id={id}
            type="text"
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={(event) => {
              setOpen(true);
              event.currentTarget.select();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              if (event.key === "ArrowDown" && open) {
                event.preventDefault();
                setActiveIndex((index) => Math.min(index + 1, matches.length - 1));
              }
              if (event.key === "ArrowUp" && open) {
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
              }
              if (event.key === "Enter" && open && matches.length > 0) {
                event.preventDefault();
                select(matches[activeIndex] ?? matches[0]);
              }
            }}
            placeholder="Choose a bus stop"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={`${id}-suggestions`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>
        <ChevronDown size={16} className={`field-chevron ${open ? "rotated" : ""}`} aria-hidden="true" />
      </div>
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
      {open && (
        <div className="suggestions" id={`${id}-suggestions`} role="listbox" aria-label={`${label} suggestions`}>
          {matches.length ? (
            matches.map((stop, index) => (
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`suggestion ${index === activeIndex ? "active" : ""}`}
                key={stop}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => select(stop)}
              >
                <MapPin size={15} aria-hidden="true" />
                <span>{stop}</span>
                {stop.toLowerCase() === value.trim().toLowerCase() && <Check size={15} aria-hidden="true" />}
              </button>
            ))
          ) : (
            <p className="suggestion-empty">No stops found. Try another Kolkata stop.</p>
          )}
          {matches.length > 0 && (
            <p className="suggestion-hint"><Footprints size={12} aria-hidden="true" /> Tap a stop, or use ↑ ↓ then Enter</p>
          )}
        </div>
      )}
    </div>
  );
}

function HeroMap() {
  return (
    <div className="hero-map" aria-label="Illustration of a Kolkata bus route connecting city stops" role="img">
      <div className="map-topline">
        <span className="map-topline-dot" />
        <span>THE CITY, CONNECTED</span>
        <span className="map-topline-icon">✳</span>
      </div>
      <svg className="map-illustration" viewBox="0 0 560 350" fill="none" aria-hidden="true">
        <path d="M-30 145C57 132 91 153 148 204C196 246 257 266 325 234C380 207 440 165 594 177" stroke="#c2dcc9" strokeWidth="18" strokeLinecap="round" />
        <path d="M125 -30C119 56 143 109 201 143C264 180 298 219 282 385" stroke="#c2dcc9" strokeWidth="14" strokeLinecap="round" />
        <path d="M412 -20C386 70 380 123 412 178C445 235 442 278 422 383" stroke="#c2dcc9" strokeWidth="13" strokeLinecap="round" />
        <path d="M-20 283C92 289 147 264 211 227C284 184 348 183 588 263" stroke="#cfe3d1" strokeWidth="9" strokeLinecap="round" />
        <path d="M-20 58C65 86 132 91 181 73C244 48 305 56 363 92C417 126 492 130 585 89" stroke="#cfe3d1" strokeWidth="9" strokeLinecap="round" />
        <path d="M78 76H168C204 76 217 91 229 124L250 173C263 202 290 207 324 207H348C381 207 395 220 395 254V279H484" stroke="#f7faf1" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M78 76H168C204 76 217 91 229 124L250 173C263 202 290 207 324 207H348C381 207 395 220 395 254V279H484" stroke="#17604a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="78" cy="76" r="15" fill="#f7faf1" />
        <circle cx="78" cy="76" r="8" fill="#f39769" />
        <circle cx="178" cy="78" r="10" fill="#f7faf1" />
        <circle cx="178" cy="78" r="5" fill="#17604a" />
        <circle cx="348" cy="207" r="10" fill="#f7faf1" />
        <circle cx="348" cy="207" r="5" fill="#17604a" />
        <circle cx="484" cy="279" r="15" fill="#f7faf1" />
        <circle cx="484" cy="279" r="8" fill="#f39769" />
        <g transform="translate(212 127)">
          <rect x="-5" y="4" width="112" height="93" rx="24" fill="#ffffff" fillOpacity="0.4" />
          <rect x="2" y="0" width="98" height="84" rx="21" fill="#164d3d" />
          <rect x="13" y="12" width="76" height="35" rx="8" fill="#d6eee0" />
          <path d="M51 12V47" stroke="#164d3d" strokeWidth="5" />
          <rect x="14" y="56" width="24" height="9" rx="4.5" fill="#f5a772" />
          <rect x="64" y="56" width="24" height="9" rx="4.5" fill="#f5a772" />
          <rect x="15" y="78" width="19" height="12" rx="4" fill="#263f37" />
          <rect x="68" y="78" width="19" height="12" rx="4" fill="#263f37" />
          <path d="M34 73H68" stroke="#cce4d3" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g>
          <rect x="39" y="25" width="109" height="30" rx="15" fill="#ffffff" />
          <text x="93.5" y="44" textAnchor="middle" fill="#27483b" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">Esplanade</text>
          <rect x="391" y="295" width="86" height="30" rx="15" fill="#ffffff" />
          <text x="434" y="314" textAnchor="middle" fill="#27483b" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">Garia</text>
          <rect x="331" y="144" width="104" height="29" rx="14.5" fill="#ffffff" fillOpacity="0.88" />
          <text x="383" y="163" textAnchor="middle" fill="#426653" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif">Park Street</text>
        </g>
      </svg>
      <div className="map-caption">
        <span className="map-caption-icon"><Route size={19} strokeWidth={2.2} /></span>
        <span><strong>Good routes. Better days.</strong><small>Wherever your day takes you.</small></span>
        <ArrowUpRight size={18} className="map-caption-arrow" />
      </div>
    </div>
  );
}

function TripCard({ trip, onOpen, firstUpcoming }: {
  trip: BusTrip;
  onOpen: () => void;
  firstUpcoming: boolean;
}) {
  const departure = formatClock(trip.departure);
  const arrival = formatClock(trip.arrival);
  const via = trip.via.length
    ? `${trip.via.slice(0, 3).join(" · ")}${trip.via.length > 3 ? ` · +${trip.via.length - 3} more` : ""}`
    : "Direct journey";

  return (
    <article className="trip-card">
      <button
        type="button"
        className="trip-main"
        onClick={onOpen}
        aria-label={`Bus ${trip.number}, ${trip.type}, ${departure.time} ${departure.period} from ${trip.boarding} to ${trip.alighting}. Open all details and stops.`}
      >
        <span className="trip-identity">
          <span className={`route-square ${trip.type === "AC" ? "ac" : ""}`}><BusFront size={22} strokeWidth={2} /></span>
          <span className="trip-identity-text">
            <span className="route-heading"><strong>{trip.number}</strong><span className={`type-badge ${trip.type === "AC" ? "ac" : ""}`}>{trip.type}</span></span>
            <span className="route-subtitle">{trip.operator} <span className="dot-separator">·</span> to {trip.terminusTo}</span>
          </span>
        </span>

        <span className="trip-times">
          <span className="trip-time-place">
            <span className="trip-clock"><time>{departure.time}</time><span>{departure.period}</span></span>
            <span className="trip-stop-name">{trip.boarding}</span>
          </span>
          <span className="journey-connector" aria-label={`${formatDuration(trip.duration)} journey`}>
            <span className="connector-line"><i /><i /></span>
            <span>{formatDuration(trip.duration)}</span>
          </span>
          <span className="trip-time-place arrival">
            <span className="trip-clock"><time>{arrival.time}</time><span>{arrival.period}</span></span>
            <span className="trip-stop-name">{trip.alighting}</span>
          </span>
        </span>

        <span className="details-hint"><span>All stops</span><ArrowUpRight size={15} aria-hidden="true" /></span>
      </button>
      <div className="trip-bottom">
        <span className="via-label"><CornerDownRight size={15} aria-hidden="true" /> Via {via}</span>
        {firstUpcoming ? <span className="next-label"><span /> Next departure</span> : <span className="scheduled-label"><Clock3 size={13} /> Scheduled</span>}
        <span className="click-hint">Click for full details</span>
      </div>
    </article>
  );
}

interface HistoryEntry {
  key: string;
  tripId: string;
  from: string;
  to: string;
  number: string;
  type: ServiceType;
  boarding: string;
  alighting: string;
  departure: number;
  viewedAt: number;
}

const HISTORY_KEY = "cholo-recent-buses";
const HISTORY_LIMIT = 6;

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

function BusDetailModal({ trip, onClose }: { trip: BusTrip | null; onClose: () => void }) {
  useEffect(() => {
    if (!trip) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [trip, onClose]);

  if (!trip) return null;

  const departure = formatClock(trip.departure);
  const arrival = formatClock(trip.arrival);
  const first = formatClock(trip.serviceStart);
  const last = formatClock(trip.serviceEnd);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-route">
            <span className={`route-square large ${trip.type === "AC" ? "ac" : ""}`}><BusFront size={26} strokeWidth={2} /></span>
            <span className="modal-route-text">
              <span className="modal-title-row">
                <strong id="detail-title">{trip.number}</strong>
                <span className={`type-badge ${trip.type === "AC" ? "ac" : ""}`}>{trip.type}</span>
                <span className="operator-chip">{trip.operator}</span>
              </span>
              <span className="modal-terminus">{trip.terminusFrom}<ArrowRight size={13} />{trip.terminusTo}</span>
            </span>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close bus details" autoFocus>
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="modal-stats">
          <div><span><PersonStanding size={13} aria-hidden="true" /> Departs {trip.boarding}</span><strong>{departure.time} <em>{departure.period}</em></strong></div>
          <div><span><Flag size={13} aria-hidden="true" /> Arrives {trip.alighting}</span><strong>{arrival.time} <em>{arrival.period}</em></strong></div>
          <div><span><Timer size={13} aria-hidden="true" /> Journey time</span><strong>{formatDuration(trip.duration)}</strong></div>
          <div><span><BusFront size={13} aria-hidden="true" /> Runs every</span><strong>{trip.headway} min</strong></div>
          <div><span><Sunrise size={13} aria-hidden="true" /> First bus</span><strong>{first.time} <em>{first.period}</em></strong></div>
          <div><span><Sunset size={13} aria-hidden="true" /> Last bus</span><strong>{last.time} <em>{last.period}</em></strong></div>
        </div>

        <div className="modal-amenities">
          {trip.type === "AC" ? <span><Snowflake size={13} aria-hidden="true" /> Air conditioned</span> : <span><Wind size={13} aria-hidden="true" /> Open windows</span>}
          <span><Users size={13} aria-hidden="true" /> {trip.operator} service</span>
          <span><Armchair size={13} aria-hidden="true" /> {trip.fullStops.length} stops</span>
          <span><Accessibility size={13} aria-hidden="true" /> Front seats kept free for seniors &amp; wheelchair users</span>
        </div>

        <div className="modal-body">
          <div className="modal-section-heading"><Route size={16} /> All stops on this trip <span>{trip.fullStops.length} stops</span></div>
          <div className="stop-timeline modal-timeline">
            {trip.fullStops.map((stop) => {
              const clock = formatClock(stop.minutes);
              const role = !stop.journey
                ? "other"
                : stop.name === trip.boarding
                  ? "boarding"
                  : stop.name === trip.alighting
                    ? "alighting"
                    : "journey";
              return (
                <div className={`timeline-stop ${role}`} key={`${trip.id}-full-${stop.name}`}>
                  <span className="timeline-dot" />
                  <span className="timeline-name">
                    {stop.name}
                    {role === "boarding" && <em>Board here</em>}
                    {role === "alighting" && <em>Get off here</em>}
                    {role === "journey" && <em className="on-route">On your route</em>}
                  </span>
                  <span className="timeline-time">{clock.time} {clock.period}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-note"><Info size={14} /> Sample schedule for this preview · not a live or official timetable.</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [themeReady, setThemeReady] = useState(false);
  const [from, setFrom] = useState("Esplanade");
  const [to, setTo] = useState("Garia");
  const [time, setTime] = useState("08:00");
  const [submitted, setSubmitted] = useState<Journey>({ from: "Esplanade", to: "Garia", time: "08:00" });
  const [view, setView] = useState<View>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [detailTrip, setDetailTrip] = useState<BusTrip | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [errors, setErrors] = useState<{ from?: string; to?: string }>({});
  const [today, setToday] = useState("Today in Kolkata");
  const [quickTimes, setQuickTimes] = useState<{ label: string; value: string }[]>([
    { label: "Morning 9 AM", value: "09:00" },
    { label: "Evening 6 PM", value: "18:00" },
  ]);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const initial = window.setTimeout(() => {
      const saved = window.localStorage.getItem("cholo-theme");
      if (saved === "dark" || saved === "light") setTheme(saved);
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
      setThemeReady(true);
    }, 0);
    return () => window.clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("cholo-theme", theme);
  }, [theme, themeReady]);

  useEffect(() => {
    const initial = window.setTimeout(() => {
      const current = kolkataTime();
      setTime(current);
      setSubmitted((journey) => ({ ...journey, time: current }));
      setToday(kolkataDate());
    }, 0);
    const timer = window.setInterval(() => setToday(kolkataDate()), 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, []);

  const allTrips = useMemo(() => findTrips(submitted.from, submitted.to), [submitted.from, submitted.to]);
  const filteredTrips = useMemo(
    () => allTrips.filter((trip) => typeFilter === "all" || trip.type === typeFilter),
    [allTrips, typeFilter],
  );
  const upcomingTrips = useMemo(
    () => filteredTrips.filter((trip) => trip.departure >= parseClock(submitted.time)),
    [filteredTrips, submitted.time],
  );
  const displayedTrips = view === "upcoming" ? upcomingTrips : filteredTrips;
  const visibleTrips = displayedTrips.slice(0, visibleCount);
  const selectedClock = formatClock(parseClock(submitted.time));

  useEffect(() => {
    const initial = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(HISTORY_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (item: unknown): item is HistoryEntry =>
                Boolean(item) && typeof item === "object" && typeof (item as HistoryEntry).tripId === "string",
            );
            setHistory(valid.slice(0, HISTORY_LIMIT));
          }
        }
      } catch {
        // ignore unreadable history
      }
      setHistoryReady(true);
    }, 0);
    return () => window.clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history, historyReady]);

  useEffect(() => {
    const onScroll = () => setShowTopButton(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openTrip(trip: BusTrip) {
    setDetailTrip(trip);
    setHistory((current) => {
      const entry: HistoryEntry = {
        key: `${trip.id}:${submitted.from}->${submitted.to}`,
        tripId: trip.id,
        from: submitted.from,
        to: submitted.to,
        number: trip.number,
        type: trip.type,
        boarding: trip.boarding,
        alighting: trip.alighting,
        departure: trip.departure,
        viewedAt: Date.now(),
      };
      return [entry, ...current.filter((item) => item.key !== entry.key)].slice(0, HISTORY_LIMIT);
    });
  }

  function openHistoryEntry(entry: HistoryEntry) {
    const trip = findTrip(entry.from, entry.to, entry.tripId);
    if (trip) setDetailTrip(trip);
  }

  function resetResultControls() {
    setTypeFilter("all");
    setVisibleCount(6);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validFrom = resolveStop(from);
    const validTo = resolveStop(to);
    const nextErrors: { from?: string; to?: string } = {};
    if (!validFrom) nextErrors.from = "Please choose a stop from the list.";
    if (!validTo) nextErrors.to = "Please choose a stop from the list.";
    if (validFrom && validTo && validFrom === validTo) nextErrors.to = "Choose a different destination.";
    setErrors(nextErrors);
    if (!validFrom || !validTo || validFrom === validTo) return;

    const chosenTime = /^\d{2}:\d{2}$/.test(time) ? time : kolkataTime();
    setTime(chosenTime);
    setSubmitted({ from: validFrom, to: validTo, time: chosenTime });
    setView("upcoming");
    resetResultControls();
    window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function choosePopular(journey: { from: string; to: string }) {
    const chosenTime = /^\d{2}:\d{2}$/.test(time) ? time : kolkataTime();
    setFrom(journey.from);
    setTo(journey.to);
    setTime(chosenTime);
    setSubmitted({ ...journey, time: chosenTime });
    setErrors({});
    setView("upcoming");
    resetResultControls();
    window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function changeView(nextView: View) {
    setView(nextView);
    setVisibleCount(6);
  }

  return (
    <div className="site-shell" id="top">
      <header className="site-header">
        <div className="header-inner page-container">
          <a href="#top" className="brand" aria-label="Cholo home">
            <span className="brand-mark"><BusFront size={23} strokeWidth={2.1} /></span>
            <span className="brand-words"><strong>cholo<span>.</span></strong><small>KOLKATA BUS GUIDE</small></span>
          </a>
          <nav className="header-nav" aria-label="Main navigation">
            <a className="nav-active" href="#search">Find a bus</a>
            <a href="#how-it-works">How it works</a>
            <a href="#about">About</a>
          </nav>
          <div className="header-actions">
            <span className="city-chip"><span className="city-pulse" /><span>Kolkata, WB</span></span>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero page-container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-mark" /> MADE FOR MOVING AROUND KOLKATA</div>
            <h1 id="hero-title">More going.<br /><span>Less guessing.</span></h1>
            <p className="hero-description">Your everyday guide to Kolkata bus timetables. Find scheduled buses between your stops and make every journey a little easier.</p>
            <div className="hero-points">
              <span><Check size={15} strokeWidth={3} /> No sign-up needed</span>
              <span><Check size={15} strokeWidth={3} /> Today&apos;s schedules</span>
            </div>
          </div>
          <HeroMap />
        </section>

        <section className="search-section page-container" id="search" aria-labelledby="search-title">
          <div className="search-card">
            <div className="search-card-heading">
              <div>
                <div className="section-kicker"><span className="kicker-dash" /> PLAN YOUR RIDE</div>
                <h2 id="search-title">Where are you headed?</h2>
              </div>
              <div className="today-tag"><CalendarDays size={16} /><span>{today}</span><span className="today-dot">·</span><strong>Today only</strong></div>
            </div>
            <form className="journey-form" onSubmit={handleSearch} noValidate>
              <div className="stops-group">
                <StopField id="from-stop" label="FROM" value={from} onChange={(value) => { setFrom(value); setErrors((current) => ({ ...current, from: undefined })); }} error={errors.from} />
                <button
                  className="swap-button"
                  type="button"
                  onClick={() => { setFrom(to); setTo(from); setErrors({}); }}
                  aria-label="Swap origin and destination"
                  title="Swap stops"
                ><ArrowLeftRight size={18} strokeWidth={2.2} /></button>
                <StopField id="to-stop" label="TO" value={to} onChange={(value) => { setTo(value); setErrors((current) => ({ ...current, to: undefined })); }} error={errors.to} destination />
              </div>
              <div className="time-field">
                <span className="field-marker time-marker" aria-hidden="true"><Clock3 size={19} strokeWidth={2.2} /></span>
                <div className="field-content"><label htmlFor="departure-time">LEAVING AFTER</label><input id="departure-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></div>
                <button className="now-button" type="button" onClick={() => setTime(kolkataTime())}>Now</button>
              </div>
              <button className="search-button" type="submit"><Search size={19} strokeWidth={2.3} /><span>Find buses</span><ArrowRight size={18} className="search-arrow" /></button>
            </form>
            <div className="quick-time-row">
              <span className="quick-time-label"><Clock3 size={13} aria-hidden="true" /> Quick times</span>
              <div className="quick-time-chips">
                {quickTimes.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={time === option.value ? "selected" : ""}
                    onClick={() => setTime(option.value)}
                    aria-pressed={time === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="popular-row">
              <span>Popular routes</span>
              <div className="popular-chips">{POPULAR_JOURNEYS.map((journey) => <button key={`${journey.from}-${journey.to}`} type="button" onClick={() => choosePopular(journey)}>{journey.from}<ArrowRight size={13} />{journey.to}</button>)}</div>
              <span className="data-hint"><Info size={13} /> Sample schedules · not live</span>
            </div>
          </div>
        </section>

        {history.length > 0 && (
          <section className="history-section page-container" aria-labelledby="history-title">
            <div className="history-head">
              <div>
                <div className="section-kicker"><HistoryIcon size={14} /> RECENTLY VIEWED</div>
                <h2 id="history-title">Your last buses<span className="accent-period">.</span></h2>
                <p>Tap any bus to reopen its full details and stops.</p>
              </div>
              <button type="button" className="history-clear" onClick={() => setHistory([])}>Clear history</button>
            </div>
            <div className="history-strip">
              {history.map((entry) => {
                const clock = formatClock(entry.departure);
                return (
                  <button key={entry.key} type="button" className="history-card" onClick={() => openHistoryEntry(entry)}>
                    <span className="history-card-top">
                      <span className={`route-square small ${entry.type === "AC" ? "ac" : ""}`}><BusFront size={17} strokeWidth={2.1} /></span>
                      <strong>{entry.number}</strong>
                      <span className={`type-badge ${entry.type === "AC" ? "ac" : ""}`}>{entry.type}</span>
                      <ArrowUpRight size={14} className="history-arrow" aria-hidden="true" />
                    </span>
                    <span className="history-route">{entry.boarding}<ArrowRight size={11} />{entry.alighting}</span>
                    <span className="history-meta"><Clock3 size={11} aria-hidden="true" /> {clock.time} {clock.period} · viewed {timeAgo(entry.viewedAt)}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="results-section page-container" id="results" aria-labelledby="results-title">
          <div className="results-intro">
            <div><div className="section-kicker"><span className="kicker-dash" /> YOUR JOURNEY, SORTED</div><h2 id="results-title">Buses for your day<span className="accent-period">.</span></h2><p>All the scheduled options for the journey you have in mind.</p></div>
            <div className="schedule-indicator"><span className="schedule-indicator-icon"><CalendarDays size={17} /></span><span><strong>{today}</strong><small>Kolkata local time (IST)</small></span></div>
          </div>

          <div className="journey-banner"><div className="journey-banner-stops"><span className="banner-dot origin" /><strong>{submitted.from}</strong><span className="banner-line"><ArrowRight size={17} /></span><span className="banner-dot destination" /><strong>{submitted.to}</strong></div><span className="journey-banner-count"><BusFront size={16} /> {displayedTrips.length} {displayedTrips.length === 1 ? "bus" : "buses"} {view === "upcoming" ? "after your time" : "today"}</span></div>

          <div className="results-controls">
            <div className="view-tabs" role="tablist" aria-label="Timetable view">
              <button type="button" role="tab" aria-selected={view === "upcoming"} className={view === "upcoming" ? "active" : ""} onClick={() => changeView("upcoming")}>After {selectedClock.time} {selectedClock.period}<span>{upcomingTrips.length}</span></button>
              <button type="button" role="tab" aria-selected={view === "all"} className={view === "all" ? "active" : ""} onClick={() => changeView("all")}>All day<span>{filteredTrips.length}</span></button>
            </div>
            <div className="type-filters" aria-label="Filter by bus type"><span>Show</span>{(["all", "AC", "Non-AC"] as TypeFilter[]).map((type) => <button key={type} type="button" className={typeFilter === type ? "selected" : ""} onClick={() => { setTypeFilter(type); setVisibleCount(6); }} aria-pressed={typeFilter === type}>{type === "all" ? "All buses" : type}</button>)}</div>
          </div>

          <div className="results-layout">
            <div className="results-list" role="tabpanel">
              {visibleTrips.length ? (
                <>
                  {visibleTrips.map((trip, index) => <TripCard key={trip.id} trip={trip} onOpen={() => openTrip(trip)} firstUpcoming={view === "upcoming" && index === 0} />)}
                  {displayedTrips.length > visibleCount && <button type="button" className="show-more" onClick={() => setVisibleCount(displayedTrips.length)}>Show all {displayedTrips.length} departures <ArrowRight size={17} /></button>}
                  <div className="end-note"><span /> You&apos;re all caught up for this view <span /></div>
                </>
              ) : (
                <div className="empty-state">
                  <span className="empty-art"><PersonStanding size={26} aria-hidden="true" /></span>
                  <h3>{allTrips.length === 0 ? "No direct buses for that pair yet" : view === "upcoming" ? "That's the last bus after this time" : "No buses match this filter"}</h3>
                  <p>{allTrips.length === 0
                    ? "Buses in this preview run between major hubs. Try one of these busy routes instead:"
                    : view === "upcoming"
                      ? "You can still see the full day's timetable, or pick an earlier time below."
                      : "Try selecting All buses to see every service on this route."}</p>
                  {allTrips.length === 0
                    ? <div className="empty-choices">{POPULAR_JOURNEYS.map((journey) => (
                        <button key={`empty-${journey.from}-${journey.to}`} type="button" onClick={() => choosePopular(journey)}>{journey.from}<ArrowRight size={12} aria-hidden="true" />{journey.to}</button>
                      ))}</div>
                    : view === "upcoming" && <div className="empty-choices">
                        <button type="button" onClick={() => changeView("all")}>See all-day timetable <ArrowRight size={12} aria-hidden="true" /></button>
                        <button type="button" onClick={() => setTime(toClock24(Math.max(0, parseClock(submitted.time) - 60)))}><Clock3 size={12} aria-hidden="true" /> Try 1 hour earlier</button>
                      </div>}
                </div>
              )}
            </div>
            <aside className="results-sidebar" aria-label="Timetable information">
              <div className="sidebar-tips">
                <div className="sidebar-tips-head"><span className="sidebar-tips-icon"><Lightbulb size={19} aria-hidden="true" /></span><h3>Handy for passengers</h3></div>
                <ul>
                  <li><span className="tip-icon person"><PersonStanding size={15} aria-hidden="true" /></span><p>Reach your stop a few minutes early — buses sometimes leave a little ahead of the listed time.</p></li>
                  <li><span className="tip-icon users"><Users size={15} aria-hidden="true" /></span><p>Peak hours feel crowded. Midday and late-evening buses are usually quieter.</p></li>
                  <li><span className="tip-icon access"><Accessibility size={15} aria-hidden="true" /></span><p>Seats near the front are meant for seniors and passengers with disabilities.</p></li>
                  <li><span className="tip-icon route"><Route size={15} aria-hidden="true" /></span><p>Big hubs such as Esplanade and Sealdah link to most routes in this preview.</p></li>
                </ul>
              </div>
              <div className="sidebar-note" id="about"><span className="sidebar-icon"><Info size={21} /></span><h3>A little heads-up</h3><p>This is a frontend timetable preview with <strong>preloaded sample times</strong>. It does not show live bus locations or verified official departures.</p><div className="sidebar-divider" /><div className="sidebar-fact"><span><Check size={13} /></span> No account required</div><div className="sidebar-fact"><span><Check size={13} /></span> Today&apos;s timetable view</div><div className="sidebar-fact"><span><Check size={13} /></span> Kolkata-area routes only</div></div>
              <div className="sidebar-art"><div className="sidebar-art-label">A CITY ALWAYS IN MOTION</div><div className="sidebar-path"><span /><span /><span /></div><h3>Go on, Kolkata is waiting.</h3><p>From your first stop to your last, a little planning goes a long way.</p><Navigation size={24} className="sidebar-navigation" /></div>
            </aside>
          </div>
        </section>

        <section className="how-section page-container" id="how-it-works" aria-labelledby="how-title"><div className="how-heading"><div><div className="section-kicker"><span className="kicker-dash" /> SIMPLE AS 1, 2, 3</div><h2 id="how-title">A smoother way to get there<span className="accent-period">.</span></h2></div><p>Less time figuring out the commute. More time enjoying the journey.</p></div><div className="how-grid">
  <div className="how-card"><span className="how-number">01</span><span className="how-icon"><PersonStanding size={24} /></span><h3>Pick your stops</h3><p>Choose where you&apos;re starting from and where you want to go in Kolkata.</p></div>
  <div className="how-card"><span className="how-number">02</span><span className="how-icon"><Clock3 size={24} /></span><h3>Choose a time</h3><p>Use a quick time or set your own, then see every bus for the rest of the day.</p></div>
  <div className="how-card"><span className="how-number">03</span><span className="how-icon"><BusFront size={24} /></span><h3>Tap your bus</h3><p>Open any bus to see its full route, every stop, and the times along the way.</p></div>
</div></section>
        <BusDetailModal trip={detailTrip} onClose={() => setDetailTrip(null)} />
      </main>

      {showTopButton && (
        <button type="button" className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <ArrowUp size={17} aria-hidden="true" />
          <span>Top</span>
        </button>
      )}

      <footer className="site-footer"><div className="footer-inner page-container"><div className="footer-brand"><span className="brand-mark"><BusFront size={20} /></span><span><strong>cholo<span>.</span></strong><small>Made for the way Kolkata moves.</small></span></div><p>Sample timetables only. Not live tracking or official travel advice.</p><a href="#top">Back to top <ArrowUpRight size={16} /></a></div></footer>
    </div>
  );
}
