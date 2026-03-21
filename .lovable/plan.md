

## Upgrade TimeDrumPicker: Responsive + Sakura Theme

### Context
`TimeDrumPicker` is currently unused — `CompactTimeSelector` is the active time picker in `LearnSubjects.tsx`. This plan upgrades `TimeDrumPicker` and swaps it in as the active component.

### Changes

**File 1: `src/components/TimeDrumPicker.tsx`** — Full rewrite

- **Responsive layout**: Wrapper uses `w-full md:max-w-[200px] md:mx-auto`
- **Mobile touch targets**: Use `useIsMobile()` hook to set `ITEM_HEIGHT` to 48px on mobile (h-12), 40px on desktop
- **Scroll snapping**: Add `snap-y snap-mandatory` on scroll containers, `snap-center` on each item
- **3D wheel gradients**: Replace current flat gradient masks with stronger glassmorphic gradients using `from-white/90 via-white/40 to-transparent` for a curved-wheel illusion
- **Center highlight**: Glassmorphic selection bar — `bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-xl`
- **Desktop hover**: Add `md:hover:bg-slate-100/50 md:hover:scale-105` on each time slot for mouse users
- **Sakura theme**: Outer container uses `bg-white/70 backdrop-blur-xl rounded-3xl shadow-editorial border border-white/30`
- **Scroll wheel**: Already works natively via `overflow-y-auto`; snap ensures correct alignment

**File 2: `src/pages/LearnSubjects.tsx`**

- Replace `CompactTimeSelector` import with `TimeDrumPicker`
- Update the JSX usage (same `value`/`onChange` props, add `disabled` prop support)

**File 3: `src/components/TimeDrumPicker.tsx`** — Add `disabled` prop to match `CompactTimeSelector` interface

### Technical Details

- Item height: 48px mobile / 40px desktop via `useIsMobile()` hook
- Visible items: 5 (showing 2 above, 1 center, 2 below)
- Container height calculated dynamically: `ITEM_HEIGHT * 5`
- Padding divs at top/bottom remain for correct centering of first/last items
- Gradient masks use `z-30` to overlay scroll content
- All existing smooth-scroll and snap-to-nearest logic preserved

