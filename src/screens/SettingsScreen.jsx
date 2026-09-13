import React from 'react';
import {Linking, Pressable, ScrollView, Share, Switch, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useApp} from '../context/AppContext';
import {moreAppsUrl, shareMessage, storeUrl, TELEGRAM_URL} from '../data/appLinks';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {FONT_SIZES, myanmarFont} from '../theme';

function openUrl(url) {
  Linking.openURL(url).catch(() => {});
}

async function shareApp() {
  try {
    await Share.share({message: shareMessage()});
  } catch {
    // User cancelled or share is unavailable.
  }
}

export function SettingsScreen() {
  const {settings, bumpFontSize, setFontSize, setColorScheme, openAbout} = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const isDark = settings.colorScheme === 'dark';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>အရောင်</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Dark mode</Text>
              <Text style={styles.toggleHint}>
                {isDark ? 'ဖွင့်ထားသည်' : 'ပိတ်ထားသည် · Light mode'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={on => setColorScheme(on ? 'dark' : 'light')}
              trackColor={{false: colors.line, true: colors.ink}}
              thumbColor={isDark ? colors.bg : colors.card}
              ios_backgroundColor={colors.line}
              accessibilityLabel="Dark mode"
            />
          </View>
        </View>

        <Text style={styles.section}>စာလုံးအရွယ်</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Pressable
              onPress={() => bumpFontSize(-1)}
              style={styles.step}
              accessibilityLabel="စာလုံးသေး">
              <Text style={styles.stepText}>က-</Text>
            </Pressable>
            <Text style={styles.value}>{settings.fontSize}</Text>
            <Pressable
              onPress={() => bumpFontSize(1)}
              style={styles.step}
              accessibilityLabel="စာလုံးကြီး">
              <Text style={styles.stepText}>က+</Text>
            </Pressable>
          </View>
          <View style={styles.sizes}>
            {FONT_SIZES.map(size => {
              const active = settings.fontSize === size;
              return (
                <Pressable
                  key={size}
                  onPress={() => setFontSize(size)}
                  style={[styles.sizeChip, active && styles.sizeChipActive]}>
                  <Text style={[styles.sizeLabel, active && styles.sizeLabelActive]}>
                    {size}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.menuCard]}>
          <MenuRow label="Share App" styles={styles} colors={colors} onPress={shareApp} />
          <MenuRow
            label="Rate Us"
            styles={styles}
            colors={colors}
            onPress={() => openUrl(storeUrl())}
          />
          <MenuRow
            label="More Apps"
            styles={styles}
            colors={colors}
            onPress={() => openUrl(moreAppsUrl())}
          />
          <MenuRow
            label="Telegram Contact"
            styles={styles}
            colors={colors}
            onPress={() => openUrl(TELEGRAM_URL)}
          />
          <MenuRow
            label="Check For Update"
            styles={styles}
            colors={colors}
            onPress={() => openUrl(storeUrl())}
          />
          <MenuRow label="About" styles={styles} colors={colors} last onPress={openAbout} />
        </View>
      </ScrollView>
    </View>
  );
}

function MenuRow({label, onPress, styles, colors, last}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.menuRow,
        !last && styles.menuDivider,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Text style={styles.linkTitle}>{label}</Text>
      <Icon name="chevron-right" size={20} color={colors.ink} />
    </Pressable>
  );
}

function createStyles(colors) {
  return {
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 32,
    },
    section: {
      marginTop: 20,
      marginBottom: 10,
      fontFamily: myanmarFont,
      fontSize: 16,
      fontWeight: '700',
      color: colors.ink,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },
    toggleText: {
      flex: 1,
    },
    toggleTitle: {
      fontFamily: myanmarFont,
      fontSize: 16,
      fontWeight: '700',
      color: colors.ink,
    },
    toggleHint: {
      marginTop: 4,
      fontFamily: myanmarFont,
      fontSize: 13,
      color: colors.cardMuted,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.line,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
    },
    step: {
      minWidth: 52,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.parchment,
      alignItems: 'center',
    },
    stepText: {
      fontFamily: myanmarFont,
      fontSize: 16,
      color: colors.ink,
      fontWeight: '700',
    },
    value: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.ink,
      minWidth: 36,
      textAlign: 'center',
    },
    sizes: {
      marginTop: 14,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
    },
    sizeChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.card,
    },
    sizeChipActive: {
      backgroundColor: colors.blue,
      borderColor: colors.blue,
    },
    sizeLabel: {
      fontSize: 13,
      color: colors.ink,
    },
    sizeLabelActive: {
      color: colors.onAccent,
    },
    menuCard: {
      marginTop: 20,
      paddingVertical: 4,
      paddingHorizontal: 16,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
    },
    menuDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    linkTitle: {
      flex: 1,
      fontFamily: myanmarFont,
      fontSize: 16,
      fontWeight: '700',
      color: colors.ink,
    },
    pressed: {
      opacity: 0.7,
    },
  };
}
