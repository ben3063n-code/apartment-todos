import { useRef } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import type { Todo } from '../lib/models';
import { TodoRow } from './TodoRow';

type Props = {
  todo: Todo;
  onToggle: () => void;
  onPress: () => void;
  onToggleNow?: () => void;
  folderLabel?: string;
  justCompleted?: boolean;
  onDragStart: () => void;
  onDrop: (absoluteY: number) => void;
};

export function DraggableTodoRow({
  todo,
  onToggle,
  onPress,
  onToggleNow,
  folderLabel,
  justCompleted,
  onDragStart,
  onDrop,
}: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const justDraggedRef = useRef(false);

  const handleDragEnd = (absoluteY: number) => {
    justDraggedRef.current = true;
    onDrop(absoluteY);
    setTimeout(() => {
      justDraggedRef.current = false;
    }, 300);
  };

  const guardedOnPress = () => {
    if (justDraggedRef.current) return;
    onPress();
  };

  const pan = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      isDragging.value = true;
      runOnJS(onDragStart)();
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      isDragging.value = false;
      runOnJS(handleDragEnd)(e.absoluteY);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    zIndex: isDragging.value ? 10 : 0,
    opacity: isDragging.value ? 0.85 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        <TodoRow
          todo={todo}
          onToggle={onToggle}
          onPress={guardedOnPress}
          onToggleNow={onToggleNow}
          folderLabel={folderLabel}
          justCompleted={justCompleted}
        />
      </Animated.View>
    </GestureDetector>
  );
}
