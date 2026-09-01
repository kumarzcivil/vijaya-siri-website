import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

const LONG_PRESS_MS = 500;
const MOUSE_DRAG_THRESHOLD = 5;
const PRESS_MOVE_THRESHOLD = 10;
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

interface UseLongPressReorderOptions {
  enabled: boolean;
  items: ReadonlyArray<{ id: string }>;
  fullIds: string[];
  onCommitted: (orderedIds: string[]) => void;
}

export function useLongPressReorder({
  enabled,
  items,
  fullIds,
  onCommitted,
}: UseLongPressReorderOptions) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [settling, setSettling] = useState(false);
  const [pressingId, setPressingId] = useState<string | null>(null);

  const dragRef = useRef<DragState | null>(null);
  const pressRef = useRef<PressState | null>(null);
  const pressTimer = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);
  const armedRef = useRef(false);
  const rowEls = useRef(new Map<string, HTMLDivElement | null>());
  const listRef = useRef<HTMLDivElement | null>(null);

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const fullIdsRef = useRef(fullIds);
  fullIdsRef.current = fullIds;
  const commitRef = useRef(onCommitted);
  commitRef.current = onCommitted;

  useEffect(() => {
    return () => {
      if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
      armedRef.current = false;
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

  const beginDrag = (rowId: string, pointerId: number, clientY: number) => {
    if (!enabledRef.current) return;
    setPressingId(null);
    const currentItems = itemsRef.current;
    if (currentItems.length < 2) return;
    const startVisIndex = currentItems.findIndex((s) => s.id === rowId);
    if (startVisIndex < 0) return;
    const next: DragState = {
      id: rowId,
      pointerId,
      startClientY: clientY,
      startVisIndex,
      targetVisIndex: startVisIndex,
      step: measureStep(rowId),
      offset: 0,
    };
    dragRef.current = next;
    setDrag(next);
    clearPressTimer();
    const el = rowEls.current.get(rowId);
    if (el) {
      try {
        el.setPointerCapture(pointerId);
      } catch {
        // pointer already released
      }
    }
  };

  const onRowPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabledRef.current) return;
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, label')) return;
    if (e.pointerType !== 'mouse' && !target.closest('[data-drag-handle]')) return;
    const rowId = (e.currentTarget as HTMLElement).dataset.rowId ?? '';
    clearPressTimer();
    armedRef.current = true;
    if (itemsRef.current.length >= 2) setPressingId(rowId);
    pressRef.current = {
      rowId,
      pointerId: e.pointerId,
      type: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    if (e.pointerType === 'mouse') return;
    pressTimer.current = window.setTimeout(() => {
      const p = pressRef.current;
      if (p && !p.moved) beginDrag(p.rowId, p.pointerId, p.startY);
      pressTimer.current = null;
    }, LONG_PRESS_MS);
  };

  const onRowPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (d && e.pointerId === d.pointerId) {
      const count = itemsRef.current.length;
      const min = -d.startVisIndex * d.step;
      const max = (count - 1 - d.startVisIndex) * d.step;
      const offset = Math.max(min, Math.min(max, e.clientY - d.startClientY));
      const target = Math.max(
        0,
        Math.min(count - 1, d.startVisIndex + Math.round(offset / d.step))
      );
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
        beginDrag(p.rowId, p.pointerId, p.startY);
      }
    } else if (Math.abs(dx) > PRESS_MOVE_THRESHOLD || Math.abs(dy) > PRESS_MOVE_THRESHOLD) {
      clearPressTimer();
      pressRef.current = null;
      armedRef.current = false;
      setPressingId(null);
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
    commitRef.current(fullWithout);
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
      armedRef.current = false;
      setPressingId(null);
    }
  };

  const onRowPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => endDrag(e.pointerId, true);

  const onRowPointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => endDrag(e.pointerId, false);

  const onRowContextMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (armedRef.current) e.preventDefault();
  };

  const rowStyle = (id: string): CSSProperties | undefined => {
    if (!drag) {
      if (pressingId === id) {
        return { touchAction: 'none', userSelect: 'none', WebkitTouchCallout: 'none' };
      }
      return undefined;
    }
    const visIndex = items.findIndex((s) => s.id === id);
    if (visIndex < 0) return undefined;
    if (drag.id === id) {
      return { transform: `translateY(${drag.offset}px)`, touchAction: 'none' };
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
    listRef,
    listClassName: `${drag ? ' admin-projects-list--dragging' : ''}${settling ? ' admin-projects-list--settling' : ''}`,
    pointerHandlers: {
      onRowPointerDown,
      onRowPointerMove,
      onRowPointerUp,
      onRowPointerCancel,
      onContextMenu: onRowContextMenu,
    },
    rowStyle,
    rowRef,
  };
}