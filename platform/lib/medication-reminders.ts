import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { createDiscreteMedicationReminder } from "@/shared/medication-reminder-policy";
import { shouldConfigureLocalReminder } from "@/shared/mobile-platform-parity";

const REMINDER_NOTIFICATION_KEY = "medsync.discreteMedicationReminderId";
const REMINDER_CHANNEL = "medsync-routine";

export type ReminderSetupResult =
  | { ok: true; time: string }
  | { ok: false; reason: "unsupported" | "permission_denied" | "invalid_time" };

export function configureMedicationReminderPresentation() {
  if (!shouldConfigureLocalReminder(Platform.OS)) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensureNotificationPermission() {
  if (!shouldConfigureLocalReminder(Platform.OS)) return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
      name: "Rotina de saúde",
      description: "Lembretes discretos configurados pela pessoa usuária.",
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      sound: undefined,
      vibrationPattern: [],
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === "granted";
}

export async function scheduleDiscreteMedicationReminder(time: string): Promise<ReminderSetupResult> {
  let reminder;
  try {
    reminder = createDiscreteMedicationReminder(time);
  } catch {
    return { ok: false, reason: "invalid_time" };
  }
  if (!shouldConfigureLocalReminder(Platform.OS)) return { ok: false, reason: "unsupported" };
  if (!(await ensureNotificationPermission())) return { ok: false, reason: "permission_denied" };

  const existingId = await AsyncStorage.getItem(REMINDER_NOTIFICATION_KEY);
  if (existingId) await Notifications.cancelScheduledNotificationAsync(existingId);
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: reminder.body,
      data: { route: "/(tabs)/medications" },
      ...(Platform.OS === "android" ? { channelId: REMINDER_CHANNEL } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: reminder.hour,
      minute: reminder.minute,
      repeats: true,
    },
  });
  await AsyncStorage.setItem(REMINDER_NOTIFICATION_KEY, notificationId);
  return { ok: true, time };
}

export async function cancelDiscreteMedicationReminder() {
  if (!shouldConfigureLocalReminder(Platform.OS)) return;
  const existingId = await AsyncStorage.getItem(REMINDER_NOTIFICATION_KEY);
  if (existingId) await Notifications.cancelScheduledNotificationAsync(existingId);
  await AsyncStorage.removeItem(REMINDER_NOTIFICATION_KEY);
}
