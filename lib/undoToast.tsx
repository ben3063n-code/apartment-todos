import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useAppTheme } from './useAppTheme';

type UndoState = { message: string; onUndo: () => void } | null;

type ContextValue = { showUndo: (message: string, onUndo: () => void) => void };

const UndoToastContext = createContext<ContextValue | null>(null);

const DISPLAY_DURATION = 4000;

export function UndoToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UndoState>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showUndo = useCallback((message: string, onUndo: () => void) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState({ message, onUndo });
    timeoutRef.current = setTimeout(() => setState(null), DISPLAY_DURATION);
  }, []);

  const handleUndo = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (state) state.onUndo();
    setState(null);
  };

  return (
    <UndoToastContext.Provider value={{ showUndo }}>
      {children}
      {state && <UndoToastView message={state.message} onUndo={handleUndo} />}
    </UndoToastContext.Provider>
  );
}

export function useUndoToast() {
  const ctx = useContext(UndoToastContext);
  if (!ctx) throw new Error('useUndoToast must be used within UndoToastProvider');
  return ctx;
}

function UndoToastView({ message, onUndo }: { message: string; onUndo: () => void }) {
  const { scheme } = useAppTheme();
  const { t } = useTranslation();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor: scheme === 'dark' ? '#3a3a3c' : '#1c1c1e' }, animatedStyle]}
      pointerEvents="box-none"
    >
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      <Pressable onPress={onUndo} hitSlop={8}>
        <Text style={styles.undoLabel}>{t('common.undo')}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 62,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  message: { color: '#fff', fontSize: 14, flex: 1 },
  undoLabel: { color: '#5aa9ff', fontSize: 14, fontWeight: '700' },
});
