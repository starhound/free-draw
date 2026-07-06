# Amazon Fire Deployment Notes

Checked against Amazon developer documentation on July 6, 2026.

## Current project state

Free Draw is a dependency-free PWA. It has no accounts, ads, analytics, network calls, in-app purchases, or third-party SDKs. Most coloring pages are original procedural line art, and the Classic Sheets pack is sourced from Openclipart public-domain/CC0 assets with local source metadata. That is deliberate for a child-directed drawing app: it keeps review risk and privacy disclosure surface low.

The Animal Friends and Storybook categories are original line art. Do not add modern show, movie, game, toy, or mascot characters without written license documentation.

Run locally:

```sh
npm run dev
```

Build the static web assets:

```sh
npm run build
```

The build output goes to `dist/`, which is the web directory configured in `capacitor.config.json`.

## Fire tablet packaging path

Amazon Appstore accepts Android APK submissions and also supports Android App Bundles (AAB). AAB is optional for Amazon, so either format can work. For this app, the practical path is:

1. Install Android Studio, Android SDK, and a JDK on the packaging machine.
2. Update `capacitor.config.json` with the final package id, for example `com.yourstudio.freedraw`.
3. Add Capacitor when the Android toolchain is available:

```sh
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build
npx cap add android
npx cap copy android
npx cap open android
```

4. In Android Studio, build a signed APK or AAB.
5. Test on real Fire tablets before review. Fire OS does not include Google Play services, so keep the app free of Google-only APIs.
6. Submit through the Amazon Developer Console.

This workspace cannot produce the Android package yet because Java, Gradle, and the Android SDK are not installed.

## Amazon submission checklist for this app

- Create an Amazon customer account and Amazon Developer account.
- Prepare screenshots and store icons. Amazon requires promotional image assets during submission.
- Keep `android:versionName` under 50 characters and increment `android:versionCode` on every release.
- Include both 32-bit and 64-bit support if the native wrapper later adds native libraries. A pure WebView/Capacitor app should not need custom native libraries.
- Keep the app small. Amazon warns above 50 MB and recommends minimizing download size.
- Complete the privacy questionnaire. Amazon states new apps and updates require a completed privacy questionnaire as of Q2 2025.
- Host `privacy.html` at a public HTTPS URL before submission and replace the contact line with the real support contact.
- Keep `assets/public-domain/sources.json` with the submitted build materials as the provenance record for Classic Sheets.
- Use "All Ages" only if the final submitted build stays free of external links, ads, social features, unrestricted web content, and mature content.
- Do not use Amazon DRM for this first build unless there is a specific paid-app requirement. A free kids drawing app is simpler without DRM.

## Recommended privacy questionnaire answers

For the current build:

- Does your app collect user data or transfer user data to third parties? No.
- Accounts: No.
- Location: No.
- Device IDs: No developer collection.
- Photos or videos: No developer collection. The app lets the user export a drawing locally.
- App activity, analytics, crash logs: No.
- Third-party SDKs: None.

Note: Amazon says its Appstore wrapper may communicate with the Amazon Appstore client when an Android binary starts. That is separate from this app's own code, but the final questionnaire should still be reviewed carefully at submission time.

## Official references

- Understanding Amazon Appstore submission: https://developer.amazon.com/docs/app-submission/understanding-submission.html
- Amazon Appstore privacy labels: https://developer.amazon.com/docs/app-submission/appstore-privacy-labels.html
- App bundles: https://developer.amazon.com/docs/app-submission/app-bundles.html
