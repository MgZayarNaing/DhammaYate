# Audio player AppDialog design

**Date:** 2026-10-14  
**Status:** Approved for planning

## Goal

Replace the three native `Alert.alert` calls in `AudioPlayerScreen` with a custom, themed dialog that matches the app’s black/gold look and feels more intentional than the system alert.

## Scope

| In | Out |
|----|-----|
| Delete confirmation | Other screens’ alerts (none today beyond player) |
| Delete-failed message | App-wide toast / notification system |
| Download-failed message | Changing download/delete logic |

## Decisions

| Decision | Choice |
|----------|--------|
| Coverage | All three player alerts |
| Visual | Richer dialog: icon header, stronger hierarchy, ghost + filled buttons |
| Structure | Reusable `AppDialog` component; wired only from `AudioPlayerScreen` for now |
| Copy | Keep existing Burmese titles/messages |

## Component: `AppDialog`

**File:** `src/components/AppDialog.jsx` (new)

**Props (shape):**

- `visible: boolean`
- `variant: 'confirmDelete' | 'deleteFailed' | 'downloadFailed'`
- `title: string`
- `message?: string`
- `confirmLabel?: string` (default by variant)
- `cancelLabel?: string` (default `မလုပ်တော့` when cancel shown)
- `onConfirm?: () => void`
- `onClose: () => void`

**Behavior:**

- Centered card over dimmed backdrop; `animationType="fade"`
- Backdrop press and Android back → `onClose` (cancel)
- `confirmDelete`: cancel + destructive-styled confirm → `onConfirm` then close
- `deleteFailed` / `downloadFailed`: single primary dismiss → `onClose`

**Visual:**

- Card uses theme `card` / `ink` / `line` / gold accent (same family as playlist modals)
- Top: circular icon well
  - `confirmDelete` → trash
  - `deleteFailed` → alert
  - `downloadFailed` → cloud-off
- Title (strong), optional message (muted)
- Buttons: ghost cancel + filled gold primary; delete confirm uses a stronger destructive treatment (e.g. dark fill or burgundy-tint) without neon red

## `AudioPlayerScreen` changes

Replace:

1. Delete confirm `Alert.alert(...)` → open dialog `confirmDelete`
2. Delete failed `Alert.alert(...)` → open dialog `deleteFailed`
3. Download failed `Alert.alert(...)` → open dialog `downloadFailed`

Remove unused `Alert` import if no longer referenced.

Local state example: `dialog: null | { variant, title, message, onConfirm? }`.

## Success criteria

- No `Alert.alert` left in `AudioPlayerScreen`
- All three flows still work (confirm delete, show delete error, show download error)
- Dialog respects light/dark theme via existing themed styles
- No new dependencies
