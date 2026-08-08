// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.2.0"),
        .package(name: "CapacitorCommunityAppleSignIn", path: "..\..\..\node_modules\@capacitor-community\apple-sign-in"),
        .package(name: "CapacitorCommunityBackgroundGeolocation", path: "..\..\..\node_modules\@capacitor-community\background-geolocation"),
        .package(name: "CapacitorCommunityFacebookLogin", path: "..\..\..\node_modules\@capacitor-community\facebook-login"),
        .package(name: "CapacitorApp", path: "..\..\..\node_modules\@capacitor\app"),
        .package(name: "CapacitorPushNotifications", path: "..\..\..\node_modules\@capacitor\push-notifications")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorCommunityAppleSignIn", package: "CapacitorCommunityAppleSignIn"),
                .product(name: "CapacitorCommunityBackgroundGeolocation", package: "CapacitorCommunityBackgroundGeolocation"),
                .product(name: "CapacitorCommunityFacebookLogin", package: "CapacitorCommunityFacebookLogin"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorPushNotifications", package: "CapacitorPushNotifications")
            ]
        )
    ]
)
