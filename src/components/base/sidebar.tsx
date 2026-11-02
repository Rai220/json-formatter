/**
 * Peekable sidebar — wraps shadcn ui/sidebar.
 *
 * ui/sidebar.tsx stays stock. This file adds:
 *   - PeekableProvider (state machine)
 *   - PeekableSidebarProvider (bridge to shadcn)
 *   - PeekPane (the visual sidebar in ALL states)
 *   - SidebarHoverArea (peek trigger)
 *   - useSidebarMouseListener (left-edge approach + close-on-leave)
 *
 * Architecture:
 *   shadcn Sidebar = invisible gap spacer only (pushes content when expanded)
 *   PeekPane = the visual sidebar card (always mounted, transitions between states)
 *   One element, CSS transitions, no remount.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

// Re-export shadcn primitives so consumers import from base/sidebar
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import { SidebarProvider as ShadcnSidebarProvider, useSidebar as useShadcnSidebar } from "@/components/ui/sidebar"
export { useShadcnSidebar }

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = "peekable_sidebar"
const SIDEBAR_DEFAULT_WIDTH = 220
const SIDEBAR_MIN_WIDTH = 200
const SIDEBAR_MAX_WIDTH = 480
const PEEK_OPEN_DELAY = 100
const MOUSE_SPEED_THRESHOLD = 4
const HEADER_H = 48
const MOBILE_BREAKPOINT = 768
const SIDEBAR_PANE_CLASS = "sidebar-pane"

// =============================================================================
// State
// =============================================================================

interface PeekState {
  isExpanded: boolean
  isOpen: boolean
  mousePeekX: number
  width: number
  isAnimating: boolean
}

type PeekAction =
  | { type: "EXPAND"; from: string }
  | { type: "COLLAPSE"; from: string }
  | { type: "OPEN_PEEK" }
  | { type: "CLOSE_PEEK" }
  | { type: "SET_MOUSE_PEEK_X"; payload: number }
  | { type: "SET_WIDTH"; payload: number }
  | { type: "SET_ANIMATING"; payload: boolean }

function getInitialState(): PeekState {
  let isExpanded = true
  let width = SIDEBAR_DEFAULT_WIDTH

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (typeof saved.isExpanded === "boolean") isExpanded = saved.isExpanded
      if (typeof saved.width === "number" && saved.width >= SIDEBAR_MIN_WIDTH) {
        width = Math.min(saved.width, SIDEBAR_MAX_WIDTH)
      }
    }
  } catch {
    // ignore
  }

  if (typeof window !== "undefined" && window.innerWidth < 1024) {
    isExpanded = false
  }

  return { isExpanded, isOpen: false, mousePeekX: 0, width, isAnimating: false }
}

function peekReducer(state: PeekState, action: PeekAction): PeekState {
  switch (action.type) {
    case "EXPAND":
      if (state.isExpanded) return state
      return { ...state, isExpanded: true, isOpen: false, isAnimating: true }

    case "COLLAPSE":
      if (!state.isExpanded) return state
      // Mobile: close fully (no peek). Desktop: transition to peek.
      const nextIsOpen = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT ? false : true
      return { ...state, isExpanded: false, isOpen: nextIsOpen, isAnimating: true }

    case "OPEN_PEEK":
      if (state.isOpen || state.isExpanded) return state
      return { ...state, isOpen: true, isAnimating: true }

    case "CLOSE_PEEK":
      if (!state.isOpen) return state
      return { ...state, isOpen: false, mousePeekX: 0, isAnimating: true }

    case "SET_MOUSE_PEEK_X":
      if (state.mousePeekX === action.payload) return state
      return { ...state, mousePeekX: action.payload }

    case "SET_WIDTH": {
      const clamped = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, action.payload))
      if (clamped === state.width) return state
      return { ...state, width: clamped }
    }

    case "SET_ANIMATING":
      if (state.isAnimating === action.payload) return state
      return { ...state, isAnimating: action.payload }

    default:
      return state
  }
}

// =============================================================================
// Context
// =============================================================================

interface PeekActions {
  expand: (from: string) => void
  collapse: (from: string) => void
  openPeek: () => void
  closePeek: () => void
  setMousePeekX: (x: number) => void
  setWidth: (width: number) => void
  setAnimating: (v: boolean) => void
}

interface PeekContextValue {
  state: PeekState
  actions: PeekActions
  isVisible: boolean
  isPeeking: boolean
}

const PeekContext = createContext<PeekContextValue | null>(null)

export function usePeekable() {
  const ctx = useContext(PeekContext)
  if (!ctx) throw new Error("usePeekable must be used within PeekableProvider")
  return ctx
}

// =============================================================================
// Provider
// =============================================================================

export function PeekableProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(peekReducer, undefined, getInitialState)
  const isResizingRef = useRef(false)

  // Persist expanded + width
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isExpanded: state.isExpanded, width: state.width })
      )
    } catch { /* ignore */ }
  }, [state.isExpanded, state.width])

  // Derived
  const isVisible = state.isExpanded || state.isOpen
  const isPeeking = state.isOpen && !state.isExpanded


  const actions = useMemo<PeekActions>(() => ({
    expand: (from) => dispatch({ type: "EXPAND", from }),
    collapse: (from) => dispatch({ type: "COLLAPSE", from }),
    openPeek: () => dispatch({ type: "OPEN_PEEK" }),
    closePeek: () => {
      if (isResizingRef.current) {
        return
      }
      dispatch({ type: "CLOSE_PEEK" })
    },
    setMousePeekX: (x) => dispatch({ type: "SET_MOUSE_PEEK_X", payload: x }),
    setWidth: (width) => dispatch({ type: "SET_WIDTH", payload: width }),
    setAnimating: (v) => dispatch({ type: "SET_ANIMATING", payload: v }),
  }), [])

  const value = useMemo<PeekContextValue>(
    () => ({ state, actions, isVisible, isPeeking }),
    [state, actions, isVisible, isPeeking]
  )

  return <PeekContext.Provider value={value}>{children}</PeekContext.Provider>
}

// =============================================================================
// Bridge: controls shadcn SidebarProvider from peek state
// =============================================================================

export function PeekableSidebarProvider({ children }: { children: ReactNode }) {
  const { state, actions } = usePeekable()

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        actions.expand("shadcn")
      } else {
        actions.collapse("shadcn")
      }
    },
    [actions]
  )

  const mode = state.isExpanded ? "expanded" : state.isOpen ? "peek" : "collapsed"

  return (
    <ShadcnSidebarProvider
      open={state.isExpanded}
      onOpenChange={handleOpenChange}
      data-peek-state={mode}
      style={{
        "--sidebar-width": `${state.width}px`,
      } as React.CSSProperties}
    >
      {children}
    </ShadcnSidebarProvider>
  )
}

// =============================================================================
// PeekPane — the visual sidebar in all 3 states
// =============================================================================

export function PeekPane({ children }: { children: ReactNode }) {
  const { state, actions, isVisible, isPeeking } = usePeekable()
  const [hasRendered, setHasRendered] = useState(false)
  const animationTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // Skip initial mount animation
  useEffect(() => {
    requestAnimationFrame(() => setHasRendered(true))
  }, [])

  // Animation end via JS timer (Notion approach) — fires once after duration
  const DURATION = 200
  useEffect(() => {
    if (state.isAnimating) {
      clearTimeout(animationTimerRef.current)
      animationTimerRef.current = setTimeout(() => {
        actions.setAnimating(false)
      }, DURATION)
    }
    return () => clearTimeout(animationTimerRef.current)
  }, [state.isAnimating])

  // Compute animation values — one card, three positions
  const topOffset = HEADER_H + 8
  let tx: number, ty: number, opacity: number
  if (state.isExpanded) {
    tx = 8
    ty = 8
    opacity = 1
  } else if (state.isOpen) {
    tx = 8
    ty = topOffset
    opacity = 1
  } else {
    tx = 20 - state.width
    ty = topOffset
    opacity = 0
  }

  const paneHeight = state.isExpanded
    ? "calc(100% - 16px)"
    : `calc(100vh - ${topOffset}px - 8px)`

  const handleOverflowMouseMove = useCallback(() => {
    if (state.isAnimating || state.isOpen || state.isExpanded) return
    actions.openPeek()
  }, [state.isAnimating, state.isOpen, state.isExpanded, actions])

  return (
    <div
      {...(!isVisible ? { inert: "" as unknown } : {})}
      className="pointer-events-none fixed top-0 left-0 hidden h-screen shrink-0 grow-0 md:block"
      style={{
        width: 0,
        zIndex: isPeeking ? 50 : 30,
      }}
    >
      <div className="h-full">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[9] flex w-0 flex-col overflow-visible"
          onMouseMove={handleOverflowMouseMove}
        >
          {/* The card — always mounted, slides between positions */}
          <div
            className={cn(
              "group/sidebar-pane relative flex min-h-[200px] flex-col",
              SIDEBAR_PANE_CLASS,
            )}
            style={{
              width: state.width,
              height: paneHeight,
              transform: `translateX(${tx}px) translateY(${ty}px)`,
              opacity,
              pointerEvents: isVisible ? "auto" : "none",
              ...(hasRendered ? {
                transitionProperty: "transform, opacity, height",
                transitionDuration: `${DURATION}ms`,
                transitionTimingFunction: "cubic-bezier(0.31, 0.1, 0.08, 0.96)",
              } : {}),
            }}
          >
            {/* Spacer — extends hover zone above pane */}
            <div
              className="pointer-events-auto relative bg-transparent"
              style={{
                top: -8,
                height: 8,
                width: state.width,
                marginBottom: -8,
              }}
            />
            {/* Background card */}
            <div className="absolute inset-0 z-[-1] rounded-lg bg-muted border border-sidebar-border shadow-lg" />
            {/* Sidebar content */}
            <div className="flex h-full w-full flex-col overflow-hidden rounded-lg">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// SidebarHoverArea — wraps the hamburger button
// =============================================================================

export function SidebarHoverArea({ children, className }: { children: ReactNode; className?: string }) {
  const { state, actions } = usePeekable()

  const handleHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    actions.setMousePeekX(rect.right)
    actions.openPeek()
  }, [actions])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (state.isExpanded) return
    const relatedTarget = e.relatedTarget as Element | null
    if (relatedTarget?.closest(`.${SIDEBAR_PANE_CLASS}`)) {
      return
    }
  }, [state.isExpanded])

  return (
    <div
      onMouseEnter={handleHover}
      onMouseMove={handleHover}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </div>
  )
}

// =============================================================================
// Window mouse listener — left-edge approach + close-on-leave
// =============================================================================

export function useSidebarMouseListener() {
  const { state, actions } = usePeekable()
  const prevMouseRef = useRef<{ x: number; y: number } | undefined>()
  const speedRef = useRef(Infinity)
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const posTimerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    // Skip on mobile — no hover, no mouse tracking
    if (window.innerWidth < MOBILE_BREAKPOINT) return

    const handleMouseMove = (e: MouseEvent) => {
      // Speed tracking
      if (prevMouseRef.current) {
        speedRef.current = Math.hypot(
          e.clientX - prevMouseRef.current.x,
          e.clientY - prevMouseRef.current.y
        )
      }
      prevMouseRef.current = { x: e.clientX, y: e.clientY }
      clearTimeout(posTimerRef.current)
      posTimerRef.current = setTimeout(() => {
        prevMouseRef.current = undefined
      }, 100)

      const mouseX = e.clientX
      const peekX = Math.max(24, state.mousePeekX)
      const isNearBottom = e.clientY > window.innerHeight - 200

      // Open: slow mouse near left edge
      if (
        !state.isExpanded &&
        !state.isOpen &&
        !isNearBottom &&
        mouseX < peekX &&
        speedRef.current < MOUSE_SPEED_THRESHOLD
      ) {
        if (!openTimerRef.current) {
          openTimerRef.current = setTimeout(() => {
            actions.openPeek()
            openTimerRef.current = undefined
          }, PEEK_OPEN_DELAY)
        }
      } else {
        if (openTimerRef.current) {
          clearTimeout(openTimerRef.current)
          openTimerRef.current = undefined
        }
      }

      // Close: past sidebar width AND past peekX
      if (state.isOpen && !state.isExpanded && mouseX > state.width && mouseX > peekX) {
        actions.closePeek()
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = undefined
      if (!e.relatedTarget && state.isOpen && !state.isExpanded) {
        actions.closePeek()
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseout", handleMouseOut)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseout", handleMouseOut)
      clearTimeout(openTimerRef.current)
      clearTimeout(posTimerRef.current)
    }
  }, [state.isOpen, state.isExpanded, state.width, state.mousePeekX, actions])
}
