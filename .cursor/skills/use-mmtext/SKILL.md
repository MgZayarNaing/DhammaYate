---
name: use-mmtext
description: >-
  Use MmText instead of React Native Text for UI labels and copy, and never add
  lineHeight. Use when writing or editing screens, components, styles, Myanmar
  text, or any Text usage in this app.
---

# Use MmText

## Rules

1. Use `MmText` instead of `Text` for user-visible labels and copy.
2. Import from `src/components/MmText.jsx` (relative path as needed).
3. Do not add `lineHeight` in text styles.
4. Do not use `fontWeight` — it breaks stacked Myanmar glyphs on iOS.
5. Prefer `MmText` over spreading `...mmText` / `...mmTextBold` onto plain `Text`.
6. Keep other `Text` props (`numberOfLines`, `style`, etc.); only swap the component.

## Component

`MmText` wraps React Native `Text` and applies `mmText` from `src/theme.js` last so the Myanmar Regular face wins. See `src/components/MmText.jsx`.

## Examples

Correct:

```jsx
import {MmText} from '../components/MmText';

<MmText style={styles.title}>{title}</MmText>

const styles = {
  title: {
    fontSize: 17,
    color: colors.ink,
  },
};
```

Incorrect:

```jsx
import {Text} from 'react-native';

<Text style={styles.title}>{title}</Text>

const styles = {
  title: {
    ...mmText,
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '700',
  },
};
```
