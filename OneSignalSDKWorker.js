<!-- 🚀 OneSignal Push Notifications (Web Push) -->
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "7dd59624-d56e-47aa-b195-de1badc2cca2",
      allowLocalhostAsSecureOrigin: true,
      autoResubscribe: true,
      notifyButton: { enable: false },
      serviceWorkerParam: { scope: "/wslnycash/" },
      serviceWorkerPath: "/wslnycash/OneSignalSDKWorker.js",
      promptOptions: {
        slidedown: {
          prompts: [{
            type: "push",
            autoPrompt: true,
            text: {
              actionMessage: "نفعّل الإشعارات عشان يوصلك كل جديد؟",
              acceptButton: "موافق",
              cancelButton: "لاحقاً"
            },
            delay: { pageViews: 1, timeDelay: 5 }
          }]
        }
      }
    });
  });
</script>
<!-- نهاية OneSignal -->
