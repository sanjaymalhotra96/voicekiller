import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { iconSize, palette } from '@/theme';

type Props = { children: ReactNode };
type State = { error: Error | null };

// Catches render crashes anywhere below it and shows a retry screen
// instead of a blank app.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook a crash reporter (e.g. Sentry) in here.
    console.error(error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    return this.state.error ? (
      <CrashScreen onRetry={this.reset} />
    ) : (
      this.props.children
    );
  }
}

function CrashScreen({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-canvas px-6">
      <Icon
        name="alert"
        size={iconSize.xxl}
        color={palette.danger.DEFAULT}
      />
      <AppText variant="title" className="text-center">
        {t('crash.title')}
      </AppText>
      <AppText className="text-center">{t('crash.message')}</AppText>
      <Button
        className="mt-4 self-stretch"
        label={t('crash.retry')}
        onPress={onRetry}
      />
    </View>
  );
}
