import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

const LONG_PRESS_MS = 500;
const MOUSE_DRAG_THRESHOLD = 5;
const PRESS_CANCEL_THRESHOLD = 10;
const SETTLE_MS = 180;

interface DragState {
  id: string;
  pointerId: number;
  startClientY: number;
  startVisIndex: number;
  targetVisIndex: number;
  step: number;
  offset: number;
}

interface PressState {
  rowId: string;
  pointerId: number;
  type: string;
  startX: number;
  startY: number;
  moved: boolean;
}

interface UseServiceReorderOptions {
  enabled: boolean;
  items: ReadonlyArray<{ id: string }>;
  fullIds: string[];
  onCommitted: (orderedIds: string[]) => void;
}

export function useServiceReorder({
  enabled,
  items,
  fullIds,
  onCommitted,
}: UseServiceReorderOptions) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [settling, setSettling] = useState(false);
  const [pressId, setPressId] = useState<string | null>(null);

  const dragRef = useRef<DragState | null>(null);
  const pressRef = useRef<PressState | null>(null);
  const pressTimer = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);
  const rowEls = useRef(new Map<string, HTMLDivElement | null>());
  const listRef = useRef<HTMLDivElement | null>(null);

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const fullIdsRef = useRef(fullIds);
  fullIdsRef.current = fullIds;
  const onCommittedRef = useRef(onCommitted);
  onCommittedRef.current = onCommitted;

  useEffect(() => {
    return () => {
      if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
      pressRef.current = null;
    };
  }, []);

  const clearPressTimer = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const measureStep = (id: string): number => {
    const el = rowEls.current.get(id) as HTMLElement | null;
    if (!el) return 88;
    const next = el.nextElementSibling as HTMLElement | null;
    if (next) {
      const top = el.getBoundingClientRect().top;
      const nextTop = next.getBoundingClientRect().top;
      if (nextTop > top) return nextTop - top;
    }
    const prev = el.previousElementSibling as HTMLElement | null;
    if (prev) {
      const top = el.getBoundingClientRect().top;
      const prevTop = prev.getBoundingClientRect().top;
      if (top > prevTop) return top - prevTop;
    }
    const gap = listRef.current ? parseFloat(getComputedStyle(listRef.current).rowGap) || 0 : 0;
    return el.offsetHeight + gap;
  };

  const beginDrag = (p: PressState) => {
    if (!enabledRef.current) return;
    const currentItems = itemsRef.current;
    if (currentItems.length < 2) return;
    const startVisIndex = currentItems.findIndex((s) => s.id === p.rowId);
    if (startVisIndex < 0) return;
    const next: DragState = {
      id: p.rowId,
      pointerId: p.pointerId,
      startClientY: p.startY,
      startVisIndex,
      targetVisIndex: startVisIndex,
      step: measureStep(p.rowId),
      offset: 0,
    };
    dragRef.current = next;
    setDrag(next);
    clearPressTimer();
    setPressId(null);
    const el = rowEls.current.get(p.rowId);
    if (el) {
      try {
        el.setPointerCapture(p.pointerId);
      } catch {
        // pointer already released
      }
    }
  };

  const cancelPress = () => {
    clearPressTimer();
    pressRef.current = null;
    setPressId(null);
  };

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>, rowId: string) => {
    if (!enabledRef.current) return;
    if (e.button !== 0) return;
    cancelPress();
    pressRef.current = {
      rowId,
      pointerId: e.pointerId,
      type: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    if (itemsRef.current.length >= 2) setPressId(rowId);
    if (e.pointerType === 'mouse') return;
    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = null;
      const p = pressRef.current;
      if (p && !p.moved) beginDrag(p);
    }, LONG_PRESS_MS);
  };

  const onRowPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (d && e.pointerId === d.pointerId) {
      const count = itemsRef.current.length;
      const min = -d.startVisIndex * d.step;
      const max = (count - 1 - d.startVisIndex) * d.step;
      const offset = Math.max(min, Math.min(max, e.clientY - d.startClientY));
      const target = Math.max(0, Math.min(count - 1, d.startVisIndex + Math.round(offset / d.step)));
      if (d.offset !== offset || d.targetVisIndex !== target) {
        const next = { ...d, offset, targetVisIndex: target };
        dragRef.current = next;
        setDrag(next);
      }
      return;
    }
    const p = pressRef.current;
    if (!p || e.pointerId !== p.pointerId) return;
    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;
    if (p.type === 'mouse') {
      if (!p.moved && (Math.abs(dx) > MOUSE_DRAG_THRESHOLD || Math.abs(dy) > MOUSE_DRAG_THRESHOLD)) {
        p.moved = true;
        beginDrag(p);
      }
    } else if (Math.abs(dx) > PRESS_CANCEL_THRESHOLD || Math.abs(dy) > PRESS_CANCEL_THRESHOLD) {
      cancelPress();
    }
  };

  const commitDrag = (d: DragState) => {
    const visIds = itemsRef.current.map((s) => s.id);
    const count = visIds.length;
    const target = Math.max(0, Math.min(count - 1, d.targetVisIndex));
    if (target === d.startVisIndex) return;
    const visWithout = visIds.filter((id) => id !== d.id);
    const after = target < visWithout.length ? visWithout[target] : undefined;
    const fullWithout = fullIdsRef.current.filter((id) => id !== d.id);
    let insertAt = after ? fullWithout.indexOf(after) : -1;
    if (insertAt < 0) insertAt = fullWithout.length;
    fullWithout.splice(insertAt, 0, d.id);
    onCommittedRef.current(fullWithout);
    setSettling(true);
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => setSettling(false), SETTLE_MS);
  };

  const endDrag = (pointerId: number, commit: boolean) => {
    clearPressTimer();
    const d = dragRef.current;
    if (d && d.pointerId === pointerId) {
      if (commit) commitDrag(d);
      dragRef.current = null;
      setDrag(null);
    }
    const p = pressRef.current;
    if (p && p.pointerId === pointerId) {
      pressRef.current = null;
      setPressId(null);
    }
  };

  const onRowPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => endDrag(e.pointerId, true);

  const onRowPointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => endDrag(e.pointerId, false);

  const rowStyle = (id: string): CSSProperties | undefined => {
    if (!drag) return undefined;
    const visIndex = items.findIndex((s) => s.id === id);
    if (visIndex < 0) return undefined;
    if (drag.id === id) {
      return { transform: `translateY(${drag.offset}px)` };
    }
    if (visIndex > drag.startVisIndex && visIndex <= drag.targetVisIndex) {
      return { transform: `translateY(${-drag.step}px)` };
    }
    if (visIndex < drag.startVisIndex && visIndex >= drag.targetVisIndex) {
      return { transform: `translateY(${drag.step}px)` };
    }
    return undefined;
  };

  const rowRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) rowEls.current.set(id, el);
    else rowEls.current.delete(id);
  };

  return {
    drag,
    settling,
    pressId,
    listRef,
    listClassName: `${drag ? ' admin-projects-list--dragging' : ''}${settling ? ' admin-projects-list--settling' : ''}`,
    onHandlePointerDown,
    onRowPointerMove,
    onRowPointerUp,
    onRowPointerCancel,
    rowStyle,
    rowRef,
  };
}