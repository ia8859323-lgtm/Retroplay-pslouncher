export interface CodeTemplate {
  fileName: string;
  language: string;
  description: string;
  code: string;
}

export const ANDROID_CODE_TEMPLATES: CodeTemplate[] = [
  {
    fileName: 'EmulatorLauncher.kt',
    language: 'kotlin',
    description: 'Android Intent dispatcher to launch external standalone emulators & RetroArch cores directly with ROM URI.',
    code: `package com.retroplay.launcher.core

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.File

sealed class EmulatorTarget(
    val name: String,
    val packageName: String,
    val activityName: String? = null,
    val action: String = Intent.ACTION_VIEW
) {
    object DuckStation : EmulatorTarget(
        name = "DuckStation PS1",
        packageName = "com.github.stenzek.duckstation",
        activityName = "com.github.stenzek.duckstation.MainActivity"
    )

    object PPSSPP : EmulatorTarget(
        name = "PPSSPP Portable",
        packageName = "org.ppsspp.ppsspp",
        activityName = "org.ppsspp.ppsspp.PpssppActivity"
    )

    object RetroArch64 : EmulatorTarget(
        name = "RetroArch AArch64",
        packageName = "com.retroarch.aarch64",
        activityName = "com.retroarch.browser.retroactivity.RetroActivityFuture"
    )

    object Mupen64PlusFZ : EmulatorTarget(
        name = "M64Plus FZ",
        packageName = "org.mupen64plusae.v3.fzurita",
        activityName = "org.mupen64plusae.v3.fzurita.SplashActivity"
    )

    object AetherSX2 : EmulatorTarget(
        name = "AetherSX2 / NetherSX2",
        packageName = "xyz.aethersx2.android",
        activityName = "xyz.aethersx2.android.EmulationActivity"
    )
}

class EmulatorLauncher(private val context: Context) {

    /**
     * Launches external emulator using Android Intents.
     * Handles both FileProvider Content URIs and Direct Storage Paths for scoped storage.
     */
    fun launchGame(
        romPath: String,
        target: EmulatorTarget,
        coreLibretroPath: String? = null
    ): Boolean {
        val file = File(romPath)
        if (!file.exists()) {
            Toast.makeText(context, "ROM file not found: \$romPath", Toast.LENGTH_LONG).show()
            return false
        }

        val intent = Intent(target.action).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        }

        // Grant SAF URI permissions for Android 11+ (API 30+)
        val contentUri: Uri = try {
            FileProvider.getUriForFile(context, "\${context.packageName}.fileprovider", file)
        } catch (e: Exception) {
            Uri.fromFile(file)
        }

        when (target) {
            is EmulatorTarget.DuckStation -> {
                intent.setPackage(target.packageName)
                if (target.activityName != null) {
                    intent.setClassName(target.packageName, target.activityName)
                }
                intent.setDataAndType(contentUri, "application/octet-stream")
                intent.putExtra("bootPath", file.absolutePath)
            }

            is EmulatorTarget.PPSSPP -> {
                intent.setPackage(target.packageName)
                intent.setDataAndType(contentUri, "application/octet-stream")
                intent.putExtra("org.ppsspp.ppsspp.SHORTCUT", true)
            }

            is EmulatorTarget.RetroArch64 -> {
                intent.setPackage(target.packageName)
                if (target.activityName != null) {
                    intent.setClassName(target.packageName, target.activityName)
                }
                intent.setDataAndType(contentUri, "application/octet-stream")
                coreLibretroPath?.let { core ->
                    intent.putExtra("LIBRETRO", core)
                }
                intent.putExtra("CONFIGFILE", "/data/data/\${target.packageName}/retroarch.cfg")
                intent.putExtra("ROM", file.absolutePath)
            }

            is EmulatorTarget.Mupen64PlusFZ -> {
                intent.setPackage(target.packageName)
                intent.setDataAndType(contentUri, "application/octet-stream")
                intent.putExtra("Rom", file.absolutePath)
            }

            is EmulatorTarget.AetherSX2 -> {
                intent.setPackage(target.packageName)
                intent.setDataAndType(contentUri, "application/octet-stream")
                intent.putExtra("bootPath", file.absolutePath)
            }
        }

        return try {
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Toast.makeText(
                context,
                "Failed to launch \${target.name}. Is it installed?",
                Toast.LENGTH_LONG
            ).show()
            false
        }
    }
}
`,
  },
  {
    fileName: 'RomScanner.kt',
    language: 'kotlin',
    description: 'Recursive local storage and DocumentFile SAF ROM scanner with coroutines and extension matching.',
    code: `package com.retroplay.launcher.scanner

import android.content.Context
import android.net.Uri
import androidx.documentfile.provider.DocumentFile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import java.io.File

data class ScannedRom(
    val title: String,
    val consoleTag: String,
    val filePath: String,
    val uri: Uri,
    val fileSizeBytes: Long
)

class RomScanner(private val context: Context) {

    private val supportedExtensions = mapOf(
        "psp" to listOf("iso", "cso", "pbp"),
        "ps1" to listOf("chd", "bin", "cue", "iso", "pbp"),
        "gba" to listOf("gba", "zip"),
        "n64" to listOf("z64", "n64", "v64"),
        "snes" to listOf("sfc", "smc", "zip"),
        "nes" to listOf("nes", "zip"),
        "sega" to listOf("md", "gen", "smd"),
        "nds" to listOf("nds"),
        "dreamcast" to listOf("gdi", "cdi", "chd")
    )

    /**
     * Emits scanned ROMs asynchronously using Kotlin Flow
     */
    fun scanDirectory(treeUri: Uri): Flow<ScannedRom> = flow {
        val rootDoc = DocumentFile.fromTreeUri(context, treeUri) ?: return@flow
        scanRecursive(rootDoc) { rom ->
            emit(rom)
        }
    }.flowOn(Dispatchers.IO)

    private suspend fun scanRecursive(
        dir: DocumentFile,
        onFound: suspend (ScannedRom) -> Unit
    ) {
        val files = dir.listFiles()
        for (file in files) {
            if (file.isDirectory) {
                scanRecursive(file, onFound)
            } else {
                val name = file.name ?: continue
                val ext = name.substringAfterLast('.', "").lowercase()

                val consoleTag = supportedExtensions.entries.firstOrNull { (_, exts) ->
                    exts.contains(ext)
                }?.key

                if (consoleTag != null) {
                    val cleanTitle = cleanRomTitle(name)
                    onFound(
                        ScannedRom(
                            title = cleanTitle,
                            consoleTag = consoleTag,
                            filePath = file.uri.path ?: name,
                            uri = file.uri,
                            fileSizeBytes = file.length()
                        )
                    )
                }
            }
        }
    }

    private fun cleanRomTitle(filename: String): String {
        return filename.substringBeforeLast('.')
            .replace(Regex("\\\\s*\\\\([^)]*\\\\)"), "")
            .replace(Regex("\\\\s*\\\\[[^\\\\]]*\\\\]"), "")
            .replace('_', ' ')
            .trim()
    }
}
`,
  },
  {
    fileName: 'PS5DashboardScreen.kt',
    language: 'kotlin',
    description: 'Jetpack Compose PS5-inspired horizontal carousel dashboard with crossfading background and D-Pad focus.',
    code: `package com.retroplay.launcher.ui

import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

@Composable
fun PS5DashboardScreen(
    games: List<GameUiModel>,
    onPlayClick: (GameUiModel) -> Unit
) {
    var selectedIndex by remember { mutableStateOf(0) }
    val activeGame = games.getOrNull(selectedIndex) ?: return
    val listState = rememberLazyListState()

    // Smooth autoscroll when index shifts via Gamepad
    LaunchedEffect(selectedIndex) {
        listState.animateScrollToItem(
            index = maxOf(0, selectedIndex - 1)
        )
    }

    Box(modifier = Modifier.fillMaxSize().background(Color(0xFF070B14))) {
        // Dynamic PS5 Artwork Crossfade Background
        Crossfade(
            targetState = activeGame.bannerUrl,
            animationSpec = tween(durationMillis = 500),
            label = "BackgroundCrossfade"
        ) { bannerUrl ->
            Box(modifier = Modifier.fillMaxSize()) {
                AsyncImage(
                    model = bannerUrl,
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                // Cinematic Vignette & Bottom Gradient Gradients
                Box(
                    modifier = Modifier.fillMaxSize().background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color(0x77070B14),
                                Color(0xCC070B14),
                                Color(0xFF070B14)
                            )
                        )
                    )
                )
            }
        }

        // Active Game Metadata HUD & Horizontal Carousel
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 48.dp, vertical = 32.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Top Bar: Active Title, Trophy Summary, Release Year
            Column(modifier = Modifier.padding(top = 16.dp)) {
                Text(
                    text = activeGame.consoleTag.uppercase(),
                    style = MaterialTheme.typography.labelMedium,
                    color = Color(0xFF38BDF8)
                )
                Text(
                    text = activeGame.title,
                    style = MaterialTheme.typography.headlineLarge,
                    color = Color.White
                )
                Text(
                    text = activeGame.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFFCBD5E1),
                    maxLines = 3,
                    modifier = Modifier.widthIn(max = 600.dp)
                )
            }

            // Bottom Horizontal Scrolling Game Carousel (PS5 Style)
            LazyRow(
                state = listState,
                horizontalArrangement = Arrangement.spacedBy(20.dp),
                modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp)
            ) {
                itemsIndexed(games) { index, game ->
                    val isSelected = index == selectedIndex
                    val scale by animateFloatAsState(
                        targetValue = if (isSelected) 1.15f else 1.0f,
                        animationSpec = spring(stiffness = Spring.StiffnessLow),
                        label = "cardScale"
                    )

                    Box(
                        modifier = Modifier
                            .size(width = 160.dp, height = 220.dp)
                            .scale(scale)
                            .clip(RoundedCornerShape(12.dp))
                            .border(
                                width = if (isSelected) 3.dp else 1.dp,
                                color = if (isSelected) Color.White else Color(0x33FFFFFF),
                                shape = RoundedCornerShape(12.dp)
                            )
                            .clickable {
                                selectedIndex = index
                                onPlayClick(game)
                            }
                    ) {
                        AsyncImage(
                            model = game.coverUrl,
                            contentDescription = game.title,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }
                }
            }
        }
    }
}

data class GameUiModel(
    val id: String,
    val title: String,
    val consoleTag: String,
    val description: String,
    val coverUrl: String,
    val bannerUrl: String
)
`,
  },
  {
    fileName: 'GamepadControllerManager.kt',
    language: 'kotlin',
    description: 'Hardware controller input listener with D-Pad & analog stick navigation for Bluetooth/OTG controllers.',
    code: `package com.retroplay.launcher.input

import android.view.InputDevice
import android.view.KeyEvent
import android.view.MotionEvent

class GamepadControllerManager(
    private val onNavigateLeft: () -> Unit,
    private val onNavigateRight: () -> Unit,
    private val onNavigateUp: () -> Unit,
    private val onNavigateDown: () -> Unit,
    private val onSelectA: () -> Unit,
    private val onBackB: () -> Unit,
    private val onBumperL1: () -> Unit,
    private val onBumperR1: () -> Unit
) {
    private var lastStickMoveTime = 0L
    private val deadzone = 0.45f

    fun handleKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        if (event.source and InputDevice.SOURCE_GAMEPAD != InputDevice.SOURCE_GAMEPAD &&
            event.source and InputDevice.SOURCE_JOYSTICK != InputDevice.SOURCE_JOYSTICK
        ) {
            return false
        }

        return when (keyCode) {
            KeyEvent.KEYCODE_DPAD_LEFT -> { onNavigateLeft(); true }
            KeyEvent.KEYCODE_DPAD_RIGHT -> { onNavigateRight(); true }
            KeyEvent.KEYCODE_DPAD_UP -> { onNavigateUp(); true }
            KeyEvent.KEYCODE_DPAD_DOWN -> { onNavigateDown(); true }
            KeyEvent.KEYCODE_BUTTON_A, KeyEvent.KEYCODE_ENTER -> { onSelectA(); true }
            KeyEvent.KEYCODE_BUTTON_B, KeyEvent.KEYCODE_BACK -> { onBackB(); true }
            KeyEvent.KEYCODE_BUTTON_L1 -> { onBumperL1(); true }
            KeyEvent.KEYCODE_BUTTON_R1 -> { onBumperR1(); true }
            else -> false
        }
    }

    fun handleGenericMotionEvent(event: MotionEvent): Boolean {
        if (event.source and InputDevice.SOURCE_JOYSTICK != InputDevice.SOURCE_JOYSTICK) {
            return false
        }

        val now = System.currentTimeMillis()
        if (now - lastStickMoveTime < 180) return true // Throttle continuous axis

        val axisX = event.getAxisValue(MotionEvent.AXIS_X)
        val axisHatX = event.getAxisValue(MotionEvent.AXIS_HAT_X)

        if (axisX < -deadzone || axisHatX < -deadzone) {
            lastStickMoveTime = now
            onNavigateLeft()
            return true
        } else if (axisX > deadzone || axisHatX > deadzone) {
            lastStickMoveTime = now
            onNavigateRight()
            return true
        }

        val axisY = event.getAxisValue(MotionEvent.AXIS_Y)
        val axisHatY = event.getAxisValue(MotionEvent.AXIS_HAT_Y)

        if (axisY < -deadzone || axisHatY < -deadzone) {
            lastStickMoveTime = now
            onNavigateUp()
            return true
        } else if (axisY > deadzone || axisHatY > deadzone) {
            lastStickMoveTime = now
            onNavigateDown()
            return true
        }

        return false
    }
}
`,
  },
  {
    fileName: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Manifest configuration for Android TV / Handheld console launcher mode, storage permissions, and gamepad intent-filters.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.retroplay.launcher">

    <!-- Scoped Storage & All Files Access for Handheld Emulation Devices -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.INTERNET" />

    <!-- Gamepad & Hardware Console features (e.g. Odin 2, Retroid Pocket, Anbernic) -->
    <uses-feature android:name="android.hardware.gamepad" android:required="false" />
    <uses-feature android:name="android.software.leanback" android:required="false" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="RetroPlay PS5 Launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.RetroPlay"
        android:banner="@drawable/banner"
        android:requestLegacyExternalStorage="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboard|keyboardHidden|navigation"
            android:screenOrientation="sensorLandscape"
            android:launchMode="singleTask">

            <!-- Standard Main Launcher -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Android TV / Console Home Screen Launcher Category -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>
</manifest>
`,
  },
  {
    fileName: 'SetupGuide.md',
    language: 'markdown',
    description: 'Complete setup and build guide for Android Studio / Gradle / Retroid / Odin.',
    code: `# Android RetroPlay PS5 Launcher Setup Guide

## 1. Project Creation
- Open **Android Studio Hedgehog / Iguana / Koala**.
- Select **New Project -> Empty Activity (Jetpack Compose)**.
- Set Package Name: \`com.retroplay.launcher\`.
- Minimum SDK: **API 26 (Android 8.0)** or higher (Target API 34).

## 2. Dependencies in \`app/build.gradle.kts\`
\`\`\`kotlin
dependencies {
    // Jetpack Compose BOM
    val composeBom = platform("androidx.compose:compose-bom:2024.04.01")
    implementation(composeBom)
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.animation:animation")

    // Coil Image Loading for Game Covers & 4K Artworks
    implementation("io.coil-kt:coil-compose:2.6.0")

    // DocumentFile for Storage Access Framework (SAF)
    implementation("androidx.documentfile:documentfile:1.0.1")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")
}
\`\`\`

## 3. Storage Permissions Setup
For handheld consoles (Odin 2, Retroid Pocket 4 Pro, Ayaneo Pocket S):
1. Include \`MANAGE_EXTERNAL_STORAGE\` in \`AndroidManifest.xml\`.
2. Request \`Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION\` on first launch so your app can index SD cards and external USB sticks without scoped storage slowdowns.

## 4. Testing Emulators via ADB Intent
You can test launching directly from your terminal:
\`\`\`bash
# Launch DuckStation PS1
adb shell am start -a android.intent.action.VIEW -d "file:///sdcard/ROMs/ps1/mgs.chd" -p com.github.stenzek.duckstation

# Launch PPSSPP
adb shell am start -a android.intent.action.VIEW -d "file:///sdcard/ROMs/psp/gow.iso" -p org.ppsspp.ppsspp

# Launch RetroArch mGBA Core
adb shell am start -a android.intent.action.VIEW -d "file:///sdcard/ROMs/gba/pokemon.gba" -p com.retroarch.aarch64 -e LIBRETRO "/data/data/com.retroarch.aarch64/cores/mgba_libretro_android.so"
\`\`\`
`,
  },
];
