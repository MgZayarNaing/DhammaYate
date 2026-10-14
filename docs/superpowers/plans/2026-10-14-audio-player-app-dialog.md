# Audio Player AppDialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three native `Alert.alert` calls in `AudioPlayerScreen` with a reusable themed `AppDialog` that has an icon header and ghost + filled actions.

**Architecture:** Add `src/components/AppDialog.jsx` following the same Modal/backdrop/sheet pattern as `PlaylistModals.jsx`, but with variant-driven icons and button layouts. `AudioPlayerScreen` holds a small `dialog` state object and renders one `AppDialog` instead of calling `Alert.alert`.

**Tech Stack:** React Native `Modal` / `Pressable` / `Text` / `View`, `react-native-vector-icons/MaterialCommunityIcons`, existing `useThemedStyles` + `myanmarFont`, Jest + `react-test-renderer`.

## Global Constraints

- Cover all three player alerts: delete confirm, delete failed, download failed
- Keep existing Burmese copy strings exactly
- Variants: `confirmDelete` | `deleteFailed` | `downloadFailed`
- No new dependencies
- Theme via existing light/dark palettes (gold accent, card/ink/muted/line)
- Wire `AppDialog` only from `AudioPlayerScreen` for now
- Spec: `docs/superpowers/specs/2026-10-14-audio-player-app-dialog-design.md`

---

## File Structure

| File | Role |
|------|------|
| `src/components/AppDialog.jsx` | Reusable themed dialog |
| `src/screens/AudioPlayerScreen.jsx` | Replace `Alert.alert` with dialog state + `<AppDialog />` |
| `__tests__/AppDialog.test.js` | Renders variants, confirm/cancel behavior |

---

### Task 1: `AppDialog` component (TDD)

**Files:**
- Create: `src/components/AppDialog.jsx`
- Create: `__tests__/AppDialog.test.js`

**Interfaces:**
- Consumes: `useThemedStyles`, `myanmarFont`, MaterialCommunityIcons
- Produces:

```js
export function AppDialog({
  visible,
  variant, // 'confirmDelete' | 'deleteFailed' | 'downloadFailed'
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
})
```

- [ ] **Step 1: Write the failing test**

Create `__tests__/AppDialog.test.js`:

```js
/**
 * @format
 */
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import ReactTestRenderer from 'react-test-renderer';
import {AppDialog} from '../src/components/AppDialog';
import {AppProvider} from '../src/context/AppContext';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: async key => store[key] ?? null,
      setItem: async (key, value) => {
        store[key] = value;
      },
      removeItem: async key => {
        delete store[key];
      },
    },
  };
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

const initialMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

function wrap(ui) {
  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <AppProvider>{ui}</AppProvider>
    </SafeAreaProvider>
  );
}

function texts(root) {
  return root.root
    .findAll(node => node.type === 'Text')
    .map(node => node.props.children)
    .flat()
    .filter(child => typeof child === 'string');
}

test('confirmDelete shows title, message, cancel and confirm', async () => {
  const onConfirm = jest.fn();
  const onClose = jest.fn();
  let root;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(
      wrap(
        <AppDialog
          visible
          variant="confirmDelete"
          title="ဒေါင်းလုဒ် ဖျက်မည်လား"
          message="သိမ်းထားသော အသံဖိုင်ကို ဖျက်မည်။"
          confirmLabel="ဖျက်မည်"
          cancelLabel="မလုပ်တော့"
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      ),
    );
  });
  const labels = texts(root);
  expect(labels).toEqual(
    expect.arrayContaining([
      'ဒေါင်းလုဒ် ဖျက်မည်လား',
      'သိမ်းထားသော အသံဖိုင်ကို ဖျက်မည်။',
      'မလုပ်တော့',
      'ဖျက်မည်',
    ]),
  );

  const confirm = root.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === 'ဖျက်မည်',
  );
  await ReactTestRenderer.act(async () => {
    confirm.props.onPress();
  });
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('downloadFailed shows only dismiss action', async () => {
  const onClose = jest.fn();
  let root;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(
      wrap(
        <AppDialog
          visible
          variant="downloadFailed"
          title="ဒေါင်းလုဒ် မအောင်မြင်ပါ"
          onClose={onClose}
        />,
      ),
    );
  });
  const labels = texts(root);
  expect(labels).toEqual(expect.arrayContaining(['ဒေါင်းလုဒ် မအောင်မြင်ပါ', 'OK']));
  expect(labels).not.toEqual(expect.arrayContaining(['မလုပ်တော့']));

  const dismiss = root.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === 'OK',
  );
  await ReactTestRenderer.act(async () => {
    dismiss.props.onPress();
  });
  expect(onClose).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=AppDialog.test.js --runInBand
```

Expected: FAIL (module `AppDialog` not found, or component missing).

- [ ] **Step 3: Implement `AppDialog`**

Create `src/components/AppDialog.jsx`:

```jsx
import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

const VARIANT_ICON = {
  confirmDelete: 'trash-can-outline',
  deleteFailed: 'alert-circle-outline',
  downloadFailed: 'cloud-off-outline',
};

export function AppDialog({
  visible,
  variant,
  title,
  message,
  confirmLabel,
  cancelLabel = 'မလုပ်တော့',
  onConfirm,
  onClose,
}) {
  const {colors, styles} = useThemedStyles(createStyles);
  const showCancel = variant === 'confirmDelete';
  const primaryLabel =
    confirmLabel ?? (variant === 'confirmDelete' ? 'ဖျက်မည်' : 'OK');
  const iconName = VARIANT_ICON[variant] ?? 'information-outline';
  const destructive = variant === 'confirmDelete';

  const handlePrimary = () => {
    if (variant === 'confirmDelete') {
      onConfirm?.();
    }
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
      <View style={styles.center} pointerEvents="box-none">
        <View style={styles.card}>
          <View style={[styles.iconWell, destructive && styles.iconWellDanger]}>
            <Icon
              name={iconName}
              size={28}
              color={destructive ? colors.ink : colors.blue}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {showCancel ? (
              <Pressable
                onPress={onClose}
                style={styles.ghostBtn}
                accessibilityRole="button"
                accessibilityLabel={cancelLabel}>
                <Text style={styles.ghostText}>{cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={handlePrimary}
              style={[styles.primaryBtn, destructive && styles.dangerBtn]}
              accessibilityRole="button"
              accessibilityLabel={primaryLabel}>
              <Text
                style={[
                  styles.primaryText,
                  destructive && styles.dangerText,
                ]}>
                {primaryLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return {
    backdrop: {
      ...{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 22,
      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom: 18,
      borderWidth: 1,
      borderColor: colors.line,
      alignItems: 'center',
    },
    iconWell: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.parchment,
      marginBottom: 14,
    },
    iconWellDanger: {
      backgroundColor: colors.scheme === 'dark' ? '#2a2222' : '#f3eeee',
    },
    title: {
      fontFamily: myanmarFont,
      fontSize: 17,
      fontWeight: '700',
      color: colors.ink,
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      fontFamily: myanmarFont,
      fontSize: 14,
      lineHeight: 22,
      color: colors.muted,
      textAlign: 'center',
      marginBottom: 4,
    },
    actions: {
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      alignSelf: 'stretch',
    },
    ghostBtn: {
      flex: 1,
      minHeight: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.line,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    ghostText: {
      fontFamily: myanmarFont,
      fontSize: 15,
      color: colors.muted,
      fontWeight: '600',
    },
    primaryBtn: {
      flex: 1,
      minHeight: 44,
      borderRadius: 14,
      backgroundColor: colors.blue,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    primaryText: {
      fontFamily: myanmarFont,
      fontSize: 15,
      fontWeight: '700',
      color: colors.onAccent,
    },
    dangerBtn: {
      backgroundColor: colors.ink,
    },
    dangerText: {
      color: colors.bg,
    },
  };
}
```

If `AppProvider` is unnecessary for styles (check `useThemedStyles` / `useColors`), simplify the test harness to only what the component needs — but keep tests green.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=AppDialog.test.js --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/AppDialog.jsx __tests__/AppDialog.test.js
git commit -m "$(cat <<'EOF'
feat(ui): add themed AppDialog component

EOF
)"
```

---

### Task 2: Wire `AppDialog` into `AudioPlayerScreen`

**Files:**
- Modify: `src/screens/AudioPlayerScreen.jsx`

**Interfaces:**
- Consumes: `AppDialog` from `../components/AppDialog`
- Produces: no new exports; dialog state local to the screen

- [ ] **Step 1: Add dialog state and import**

Near other `useState` hooks in `AudioPlayerScreen`:

```js
const [dialog, setDialog] = useState(null);
```

Imports: remove `Alert` from `react-native` import list; add:

```js
import {AppDialog} from '../components/AppDialog';
```

- [ ] **Step 2: Replace the three `Alert.alert` call sites**

Keep Burmese strings exactly.

**Delete failed** (in `removeDownload` catch):

```js
setDialog({
  variant: 'deleteFailed',
  title: 'ဖျက်မရပါ',
  message: 'ဒေါင်းလုဒ်ဖိုင်ကို ဖျက်၍မရပါ။',
});
```

**Delete confirm** (in `onDownloadPress` when `offlineReady`):

```js
setDialog({
  variant: 'confirmDelete',
  title: 'ဒေါင်းလုဒ် ဖျက်မည်လား',
  message: 'သိမ်းထားသော အသံဖိုင်ကို ဖျက်မည်။',
  confirmLabel: 'ဖျက်မည်',
  cancelLabel: 'မလုပ်တော့',
  onConfirm: () => {
    removeDownload();
  },
});
```

**Download failed** (in download `.catch`):

```js
setDialog({
  variant: 'downloadFailed',
  title: 'ဒေါင်းလုဒ် မအောင်မြင်ပါ',
});
```

- [ ] **Step 3: Render `AppDialog` in the screen JSX**

Near `AddToPlaylistModal` (end of return), add:

```jsx
<AppDialog
  visible={dialog != null}
  variant={dialog?.variant ?? 'downloadFailed'}
  title={dialog?.title ?? ''}
  message={dialog?.message}
  confirmLabel={dialog?.confirmLabel}
  cancelLabel={dialog?.cancelLabel}
  onConfirm={dialog?.onConfirm}
  onClose={() => setDialog(null)}
/>
```

- [ ] **Step 4: Verify no remaining Alert usage**

```bash
rg "Alert" src/screens/AudioPlayerScreen.jsx
```

Expected: no matches (or only comments — there should be none).

- [ ] **Step 5: Run focused tests**

```bash
npm test -- --testPathPattern='AppDialog|App.test' --runInBand
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/screens/AudioPlayerScreen.jsx
git commit -m "$(cat <<'EOF'
feat(audio): replace player alerts with AppDialog

EOF
)"
```

---

### Task 3: Final verification

**Files:**
- Verify: `src/components/AppDialog.jsx`, `src/screens/AudioPlayerScreen.jsx`, `__tests__/AppDialog.test.js`

- [ ] **Step 1: Full suite**

```bash
npm test -- --runInBand
```

Expected: all suites PASS (do not leave `Alert.alert` regressions).

- [ ] **Step 2: Manual checklist** (device/emulator)

1. Offline file present → tap download/cloud → confirm dialog appears with trash icon → cancel dismisses without delete
2. Confirm → file removed
3. Force download failure (optional airplane mode on remote URL) → download-failed dialog with cloud-off + OK
4. Light and dark theme both readable

- [ ] **Step 3: Confirm success criteria from spec**

- No `Alert.alert` in `AudioPlayerScreen`
- Three flows covered
- No new dependencies

No extra commit unless Step 1 required a fix.

---

## Spec coverage (self-review)

| Spec item | Task |
|-----------|------|
| Reusable `AppDialog` | Task 1 |
| Variants + icons | Task 1 |
| Ghost + filled / destructive confirm | Task 1 |
| Replace three alerts; keep Burmese copy | Task 2 |
| Remove unused `Alert` import | Task 2 |
| Theme + no new deps | Task 1–3 |
| Success criteria | Task 3 |
