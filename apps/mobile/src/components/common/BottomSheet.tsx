import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 100;

export interface BottomSheetRef {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
}

type BottomSheetProps = {
  children?: React.ReactNode;
};

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(({ children }, ref) => {
  const translateY = useSharedValue(0);
  const active = useSharedValue(false);
  const context = useSharedValue({ y: 0 });

  const scrollTo = (destination: number) => {
    'worklet';
    active.value = destination !== 0;
    translateY.value = withSpring(destination, { damping: 50 });
  };

  useImperativeHandle(ref, () => ({
    scrollTo,
    isActive: () => active.value,
  }));

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT / 3) {
        scrollTo(0);
      } else {
        scrollTo(-SCREEN_HEIGHT / 2); // default halfway state
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
        <View style={styles.line} />
        {children}
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: '#FFF',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 25,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 999,
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D1D6',
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 2,
  },
});
