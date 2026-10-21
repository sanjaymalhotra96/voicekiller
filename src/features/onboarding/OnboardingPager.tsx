import {
  TabRouter,
  unstable_createStandardRouterNavigator,
  type NavigatorContentProps,
} from 'expo-router';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  scrollTo,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { config } from '@/config';
import { useColors } from '@/theme';

export type RevealOrigin = { x: number; y: number };

// `expand`: the next page grows out of the button as a circle.
// `collapse`: the current page shrinks into the button, uncovering the next.
export type RevealMode = 'expand' | 'collapse';

// A circle transition from page `from` to `to`, centred on `origin` (pager
// coordinates); at full `radius` it covers every corner.
type Reveal = {
  name: string;
  mode: RevealMode;
  from: number;
  to: number;
  origin: RevealOrigin;
  radius: number;
  width: number;
  height: number;
};

// Lets a step leave through a circle centred on `origin` (window
// coordinates, usually the Next button) instead of a horizontal slide.
const RevealContext = createContext<
  (name: string, origin: RevealOrigin, mode?: RevealMode) => void
>(() => {});

export const useOnboardingReveal = () => useContext(RevealContext);

// A page's part in a running transition: `grow` and `shrink` are clipped
// to the circle; `grow` and `under` are shifted over the current page.
type PageRole = 'grow' | 'shrink' | 'under';

const roleOf = (reveal: Reveal | null, index: number): PageRole | null => {
  if (!reveal) return null;
  if (index === reveal.to) return reveal.mode === 'expand' ? 'grow' : 'under';
  if (index === reveal.from && reveal.mode === 'collapse') return 'shrink';
  return null;
};

type PageProps = {
  width: number;
  focused: boolean;
  // Set only on pages taking part in the transition.
  reveal: Reveal | null;
  role: PageRole | null;
  progress: SharedValue<number>;
  shift: SharedValue<number>;
  children: ReactNode;
};

// One pager slot. While clipped, the content inside is counter-offset so it
// stays put on screen and only the circle's edge moves.
function PagerPage({
  width,
  focused,
  reveal,
  role,
  progress,
  shift,
  children,
}: PageProps) {
  const shifted = role === 'grow' || role === 'under';
  const clipped = reveal && (role === 'grow' || role === 'shrink');
  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shifted ? shift.value : 0 }],
  }));
  const clipStyle = useAnimatedStyle(() => {
    if (!clipped) {
      return {
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        borderRadius: 0,
      };
    }
    const p = role === 'grow' ? progress.value : 1 - progress.value;
    const r = reveal.radius * p;
    return {
      left: reveal.origin.x - r,
      top: reveal.origin.y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
    };
  });
  const contentStyle = useAnimatedStyle(() => {
    if (!clipped) return { left: 0, top: 0, width: '100%', height: '100%' };
    const p = role === 'grow' ? progress.value : 1 - progress.value;
    const r = reveal.radius * p;
    return {
      left: r - reveal.origin.x,
      top: r - reveal.origin.y,
      width: reveal.width,
      height: reveal.height,
    };
  });
  return (
    <Animated.View
      // The shrinking page stays above the one it uncovers.
      style={[
        { width, height: '100%', zIndex: role === 'shrink' ? 1 : 0 },
        pageStyle,
      ]}
      pointerEvents={focused ? 'auto' : 'none'}
      accessibilityElementsHidden={!focused}
      importantForAccessibility={focused ? 'auto' : 'no-hide-descendants'}
    >
      <Animated.View className="absolute overflow-hidden" style={clipStyle}>
        <Animated.View className="absolute" style={contentStyle}>
          {children}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

// Native paging keeps the previous page under the finger for swiping back.
// Route focus changes only when a swipe settles, so existing blur handlers stop
// audio and cancel generation when the user actually leaves a page. Pages
// can't be swiped forward: they leave through the arrow's circle transition.
// The scrollable width ends at the current page (plus the incoming one during
// a transition); later pages still render past it, just out of reach.
function PagerContent({
  state,
  descriptors,
  actions,
}: NavigatorContentProps<Record<string, never>>) {
  const { width } = useWindowDimensions();
  const colors = useColors();
  const reduceMotion = useReducedMotion();
  const root = useRef<View>(null);
  const pager = useAnimatedRef<Animated.ScrollView>();
  const position = useRef({ index: state.index, width });
  const target = useRef<number | null>(null);
  const [initialOffset] = useState(() => ({ x: state.index * width, y: 0 }));
  const [keyboardVisible, setKeyboardVisible] = useState(() =>
    Keyboard.isVisible(),
  );
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [reveal, setReveal] = useState<Reveal | null>(null);
  // Set when the next index change comes from a finished reveal, which has
  // already moved the pager.
  const jump = useRef(false);
  const progress = useSharedValue(0);
  const shift = useSharedValue(0);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    setVisited(previous => {
      const adjacent = state.routes.filter(
        (_, index) => Math.abs(index - state.index) <= 1,
      );
      if (adjacent.every(route => previous.has(route.key))) return previous;
      return new Set([...previous, ...adjacent.map(route => route.key)]);
    });
  }, [state.index, state.routes]);

  useEffect(() => {
    const previous = position.current;
    if (previous.index === state.index && previous.width === width) return;
    const revealed = jump.current;
    jump.current = false;
    position.current = { index: state.index, width };
    target.current = state.index;
    pager.current?.scrollTo({
      x: state.index * width,
      animated: !revealed && !reduceMotion && previous.width === width,
    });
    // The revealed page already sits in its own slot, fully uncovered.
    if (revealed) setReveal(null);
  }, [state.index, width, reduceMotion, pager]);

  const finishReveal = useCallback(
    (name: string) => {
      jump.current = true;
      actions.navigate(name);
    },
    [actions],
  );

  useEffect(() => {
    if (!reveal) return;
    // Shift only after the pages have rendered in their roles (a growing page
    // clipped to nothing, a shrinking one raised), so nothing flashes.
    shift.value = (position.current.index - reveal.to) * width;
    progress.value = withTiming(
      1,
      {
        duration: config.animation.revealMs,
        easing: Easing.inOut(Easing.cubic),
      },
      finished => {
        if (!finished) return;
        // Move the pager and drop the shift in the same UI frame, so the new
        // page stays exactly where it is on screen.
        scrollTo(pager, reveal.to * width, 0, false);
        shift.value = 0;
        scheduleOnRN(finishReveal, reveal.name);
      },
    );
  }, [reveal, width, pager, progress, shift, finishReveal]);

  const startReveal = useCallback(
    (name: string, origin: RevealOrigin, mode: RevealMode = 'expand') => {
      if (reveal) return;
      const to = state.routes.findIndex(route => route.name === name);
      if (reduceMotion || to !== state.index + 1 || !root.current) {
        actions.navigate(name);
        return;
      }
      root.current.measureInWindow((left, top, w, h) => {
        const x = origin.x - left;
        const y = origin.y - top;
        // Far enough to cover the corner furthest from the button.
        const radius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
        progress.value = 0;
        setReveal({
          name,
          mode,
          from: state.index,
          to,
          origin: { x, y },
          radius,
          width: w,
          height: h,
        });
      });
    },
    [reveal, state.routes, state.index, reduceMotion, actions, progress],
  );

  const settle = (offset: number) => {
    const index = Math.max(
      0,
      Math.min(state.routes.length - 1, Math.round(offset / width)),
    );
    // Ignore an interrupted arrow animation's end event; a new drag clears it.
    if (target.current !== null && target.current !== index) return;
    target.current = null;
    position.current = { index, width };
    if (index !== state.index) actions.navigate(state.routes[index].name);
  };

  return (
    <RevealContext.Provider value={startReveal}>
      <View ref={root} className="flex-1">
        <Animated.ScrollView
          ref={pager}
          horizontal
          pagingEnabled
          disableIntervalMomentum
          directionalLockEnabled
          bounces={false}
          removeClippedSubviews={false}
          scrollEnabled={!keyboardVisible && !reveal}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentOffset={initialOffset}
          contentContainerStyle={{
            width: (state.index + (reveal ? 2 : 1)) * width,
            height: '100%',
          }}
          style={{ flex: 1, backgroundColor: colors.canvas }}
          onScrollBeginDrag={() => {
            target.current = null;
          }}
          onScrollEndDrag={event => {
            const offset = event.nativeEvent.contentOffset.x;
            // A cancelled drag already at a page boundary may have no momentum.
            if (Math.abs(offset - Math.round(offset / width) * width) < 1) {
              settle(offset);
            }
          }}
          onMomentumScrollEnd={event =>
            settle(event.nativeEvent.contentOffset.x)
          }
        >
          {state.routes.map((route, index) => {
            const mounted =
              visited.has(route.key) || Math.abs(index - state.index) <= 1;
            return (
              <PagerPage
                key={route.key}
                width={width}
                focused={index === state.index}
                reveal={roleOf(reveal, index) ? reveal : null}
                role={roleOf(reveal, index)}
                progress={progress}
                shift={shift}
              >
                {mounted ? descriptors[route.key].render() : null}
              </PagerPage>
            );
          })}
        </Animated.ScrollView>

        {reveal ? (
          // Catches taps until the next step is in place.
          <View
            onStartShouldSetResponder={() => true}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
      </View>
    </RevealContext.Provider>
  );
}

export const OnboardingPager = unstable_createStandardRouterNavigator(
  PagerContent,
  TabRouter,
  { useOnlyUserDefinedScreens: true },
);
