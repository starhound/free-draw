# Amazon Appstore Release Checklist

Checked against Amazon Developer documentation on July 6, 2026.

## Build The Android App

This repo currently builds the web app into `dist/`. To submit to Amazon, wrap it as Android and produce a signed APK or AAB.

1. Install Android Studio, Android SDK, and a JDK.
2. Install Capacitor dependencies:

```sh
npm install @capacitor/core @capacitor/cli @capacitor/android
```

3. Set the final app id in `capacitor.config.json`, for example `com.yourstudio.freedraw`.
4. Build and create the Android project:

```sh
npm run build
npx cap add android
npx cap copy android
npx cap open android
```

5. In Android Studio, build a signed release APK or AAB.

Amazon accepts both APK and AAB. AAB is optional, not mandatory.

## Amazon Developer Console

1. Create or sign in to an Amazon customer account.
2. Create or sign in to the Amazon Developer Console with the same email.
3. Create a new app listing.
4. Upload the signed APK or AAB.
5. Target Fire tablets and any other supported Android devices you want.
6. Add store listing details from `store/amazon-listing.md`.
7. Upload screenshots, small icon, large icon, and any optional promo images.
8. Complete the privacy questionnaire.
9. Add the hosted privacy policy URL: `https://starhound.github.io/free-draw/privacy.html`.
10. Use Live App Testing or install on a real Fire tablet before final submission.
11. Submit for review.

## Privacy Answers For Current Build

For the current app code:

- Accounts: No.
- Ads: No.
- Analytics SDK: No.
- In-app purchases: No.
- Location: No.
- Push notifications: No.
- Social features: No.
- Developer collection of personal data: No.
- Drawing data transfer to third parties: No.
- Local storage: Yes, drawings and the selected page are stored on-device only.

The privacy policy is published from `docs/privacy.html` through GitHub Pages:
`https://starhound.github.io/free-draw/privacy.html`.

## Content/IP Notes

- Animal Friends, Storybook, and procedural categories are original line art.
- Classic Sheets are Openclipart public-domain/CC0 assets with metadata in `assets/public-domain/sources.json`.
- Do not add modern shows, movies, game characters, toy mascots, logos, costumes, silhouettes, or lookalike art unless you have written license documentation.

## Official References

- Submission overview: https://developer.amazon.com/docs/app-submission/understanding-submission.html
- Presubmission checklist: https://developer.amazon.com/docs/app-submission/presubmission-checklist.html
- Privacy labels: https://developer.amazon.com/docs/app-submission/appstore-privacy-labels.html
- App bundles: https://developer.amazon.com/docs/app-submission/app-bundles.html
