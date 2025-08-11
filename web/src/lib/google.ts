import { google } from "googleapis";

export async function createGoogleMeeting(params: {
  accessToken: string;
  summary: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
}) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: params.accessToken });
  const calendar = google.calendar({ version: "v3", auth });
  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startsAt.toISOString() },
      end: { dateTime: params.endsAt.toISOString() },
      conferenceData: { createRequest: { requestId: `${Date.now()}` } },
    },
  });
  const hangout = event.data.hangoutLink || event.data.conferenceData?.entryPoints?.find((e) => e?.entryPointType === "video")?.uri;
  return hangout || null;
}


