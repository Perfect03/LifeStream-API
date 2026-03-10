import type { IDevices, IAuth, IAccount, ILoginResponse } from "../types.js";
import { DEFAULT_HEADERS } from "../constants.js";
import { input, notify } from "azot";
import type { CoreContext } from "../../main.js";
import { decodeQR } from "../utils.js";

export function createAuthModule(ctx: CoreContext) {
  return {
    async checkAuth() {
      const session = await cookieStore.get("session");

      if (!session?.value) {
        await this.signIn();
        return;
      }

      const fetchAccount = await fetch(`${ctx.DOMAIN_API}/v2/account?session=${session?.value}`, {
        headers: DEFAULT_HEADERS,
      });

      if (fetchAccount?.status != 200) {
        console.error("Unauthorized");
        console.debug(await fetchAccount.text());
        await this.signIn();
        return;
      }

      const account = (await fetchAccount.json()) as IAccount;

      if (!account?.id) {
        console.debug(account);
        const session = await this.signIn();
        if (!session) {
          await this.signOut();
          await this.signIn();
        }
      }
    },
    async signIn() {
      console.debug(`Sign in ${ctx.DOMAIN_API}...`);

      if (!(await cookieStore.get("deviceId"))) {
        const uuid = crypto.randomUUID();
        cookieStore.set("deviceId", uuid);
      }

      const QR = await fetch(`${ctx.DOMAIN_API}/v2/login/qr.png`, {
        headers: DEFAULT_HEADERS,
      });
      if (!QR.ok) {
        throw new Error("Failed to auth");
      }

      const arrayBuffer = await QR.arrayBuffer();

      const link = await decodeQR(arrayBuffer);
      console.debug(link);

      try {
        const url = new URL(link);
        if (`${url.protocol}//${url.hostname}` != ctx.DOMAIN_FRONT) {
          throw new Error("Failed to auth");
        }
      } catch (e) {
        throw new Error("Failed to auth");
      }

      await notify(`To authorize, open the following link on your mobile device: \n ${link}`, {
        title: "Authorization",
      });

      const response = await new Promise<ILoginResponse>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const login = await fetch(`${ctx.DOMAIN_API}/v2/login/qr`, { headers: DEFAULT_HEADERS });

            if (!login.ok) return;

            const data = await login.json();

            if (data.session) {
              clearInterval(interval);
              resolve(data);
            }
          } catch (err) {
            console.debug(err);
          }
        }, 3000);
      });

      await notify(`You are logged in as ${response.username}`);

      return response.session;
    },
    async signOut() {
      await cookieStore.delete("session");
      await cookieStore.delete("userId");
    },
  };
}
