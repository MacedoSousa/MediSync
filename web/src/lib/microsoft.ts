import { Client } from "@microsoft/microsoft-graph-client";
import "cross-fetch/polyfill";

export async function createTeamsMeeting(params: {
  accessToken: string;
  subject: string;
  startsAt: Date;
  endsAt: Date;
}) {
  const client = Client.init({ authProvider: (done) => done(null, params.accessToken) });
  const meeting = await client.api("/me/onlineMeetings").post({
    subject: params.subject,
    startDateTime: params.startsAt.toISOString(),
    endDateTime: params.endsAt.toISOString(),
  });
  return meeting?.joinWebUrl || null;
}


