import { OAuth2Client } from "google-auth-library";

const clientId =
   "787366000753-rfosa55rhhv9lpklvj8vumc4bq8djfbb.apps.googleusercontent.com";

const client = new OAuth2Client({
   clientId,
});

export async function verifyIdToken(idToken) {
   const loginTicket = await client.verifyIdToken({
      idToken,
      audience: clientId,
   });

   const userData = loginTicket.getPayload();
   return userData;
}
