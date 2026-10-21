import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

const VARIANT_ICON = {
  confirmDelete: 'trash-can-outline',
  confirmCancel: 'close-circle-outline',
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
  const asksConfirm = variant === 'confirmDelete' || variant === 'confirmCancel';
  const primaryLabel =
    confirmLabel ?? (variant === 'confirmDelete' ? 'ဖျက်မည်' : 'OK');
  const iconName = VARIANT_ICON[variant] ?? 'information-outline';

  const handlePrimary = () => {
    if (asksConfirm) {
      onConfirm?.();
    }
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
      <View style={styles.center} pointerEvents="box-none">
        <View style={styles.card}>
          <View style={[styles.iconWell, asksConfirm && styles.iconWellDanger]}>
            <Icon
              name={iconName}
              size={28}
              color={asksConfirm ? colors.ink : colors.blue}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {asksConfirm ? (
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
              style={[styles.primaryBtn, asksConfirm && styles.dangerBtn]}
              accessibilityRole="button"
              accessibilityLabel={primaryLabel}>
              <Text
                style={[
                  styles.primaryText,
                  asksConfirm && styles.dangerText,
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
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
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

