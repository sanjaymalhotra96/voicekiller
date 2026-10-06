// Route: /support (Settings > Contact Us)
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Banner, ScreenHeader } from '@/components';
import { config } from '@/config';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { palette } from '@/theme';

// The Chatwoot website widget, opened straight away. The page tells the
// app when the chat is ready ("ready") or failed to load ("error").
function chatPage(user: { id?: string; email: string; fullName: string }) {
  const { baseUrl, websiteToken } = config.support.chatwoot;
  // JSON.stringify keeps user text from breaking out of the script.
  const identity = JSON.stringify({ email: user.email, name: user.fullName });
  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>html,body{margin:0;height:100%;background:${palette.surface}}</style></head>
<body><script>
  var post = function (m) { window.ReactNativeWebView.postMessage(m); };
  window.chatwootSettings = { position: "right", type: "standard", launcherTitle: "", hideMessageBubble: true };
  window.addEventListener("chatwoot:ready", function () {
    ${user.id ? `window.$chatwoot.setUser(${JSON.stringify(user.id)}, ${identity});` : ''}
    window.$chatwoot.toggle("open");
    post("ready");
  });
  window.addEventListener("chatwoot:error", function () { post("error"); });
  var s = document.createElement("script");
  s.src = ${JSON.stringify(baseUrl)} + "/packs/js/sdk.js";
  s.async = true;
  s.onload = function () {
    window.chatwootSDK.run({ websiteToken: ${JSON.stringify(websiteToken)}, baseUrl: ${JSON.stringify(baseUrl)} });
  };
  s.onerror = function () { post("error"); };
  document.body.appendChild(s);
</script></body></html>`;
}

export default function SupportScreen() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  // Rebuilt (and the chat reloaded) only if the user changes.
  const { id, email, fullName } = user;
  const html = useMemo(
    () => chatPage({ id, email, fullName }),
    [id, email, fullName],
  );

  const onMessage = ({ nativeEvent }: WebViewMessageEvent) => {
    if (nativeEvent.data === 'ready' || nativeEvent.data === 'error') {
      setState(nativeEvent.data);
    }
  };

  return (
    <View className="flex-1">
      <View className="px-4">
        <ScreenHeader title={t('support.title')} />
      </View>
      {state === 'error' ? (
        <View className="px-4">
          <Banner message={t('support.error')} />
        </View>
      ) : null}
      <View className="flex-1">
        <WebView
          source={{ html, baseUrl: config.support.chatwoot.baseUrl }}
          originWhitelist={['*']}
          onMessage={onMessage}
          onError={() => setState('error')}
          javaScriptEnabled
          domStorageEnabled
          // Keeps the conversation between visits (Chatwoot stores it).
          sharedCookiesEnabled
          startInLoadingState={false}
          className="flex-1"
        />
        {state === 'loading' ? (
          <View className="absolute inset-0 items-center justify-center bg-surface">
            <ActivityIndicator color={palette.primary.DEFAULT} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
