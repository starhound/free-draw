#!/bin/bash
set -e

echo "Setting up headless Android build environment..."

cd ~
mkdir -p build_tools
cd build_tools

# 1. Download Java 21
if [ ! -d "jdk21" ]; then
    echo "Downloading Amazon Corretto JDK 21..."
    wget -qO jdk21.tar.gz https://corretto.aws/downloads/latest/amazon-corretto-21-x64-linux-jdk.tar.gz
    mkdir -p jdk21
    tar -xzf jdk21.tar.gz -C jdk21 --strip-components=1
fi

export JAVA_HOME=$(pwd)/jdk21
export PATH=$JAVA_HOME/bin:$PATH
java -version

# 2. Download Android Command Line Tools
if [ ! -d "android_sdk/cmdline-tools/latest" ]; then
    echo "Downloading Android Command Line Tools..."
    wget -qO cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip
    python3 -m zipfile -e cmdline-tools.zip .
    export ANDROID_HOME=$(pwd)/android_sdk
    mkdir -p $ANDROID_HOME/cmdline-tools
    mv cmdline-tools $ANDROID_HOME/cmdline-tools/latest
    chmod +x $ANDROID_HOME/cmdline-tools/latest/bin/*
else
    export ANDROID_HOME=$(pwd)/android_sdk
fi

export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# 3. Accept licenses and install Android SDK platforms
echo "Installing Android SDK components (this may take a minute)..."
yes | sdkmanager --licenses > /dev/null
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2" > /dev/null

# 4. Build the APK
echo "Building APK via Gradle..."
cd /home/starhound/free-draw/android
./gradlew assembleDebug

echo "Build complete! APK should be located in app/build/outputs/apk/debug/"
