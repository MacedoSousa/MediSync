export type MobilePlatform = "ios" | "android" | "web" | "windows" | "macos";

export function getSafeAreaTopCompensation(platform: MobilePlatform, topInset: number): number {
  return platform === "ios" && topInset < 24 ? 56 : 0;
}

export function shouldTriggerTabHaptic(platform: MobilePlatform): boolean {
  return platform === "ios";
}

export function shouldConfigureLocalReminder(platform: MobilePlatform): boolean {
  return platform !== "web";
}
