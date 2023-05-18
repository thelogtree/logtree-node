import axios from "axios";

const SERVER_URL = "https://logtree-server.onrender.com/api/v1";

export class Logtree {
  publishableApiKey: string;
  secretKey: string;

  constructor(publishableApiKey: string, secretKey: string) {
    this.publishableApiKey = publishableApiKey;
    this.secretKey = secretKey;
  }

  /**
   * @description sends a log to Logtree which can be viewed in the Logtree platform.
   * @param {String} content whatever information you want to log to Logtree
   * @param {String} folderPath the folderPath of where you want the log to live in Logtree. (e.g. "/transactions/suspicious", "/new-users", etc.)
   * This must start with a "/" and not contain any spaces.
   * @param {String?} referenceId some referenceId you want the log to belong to (we recommend you make this the user's email when possible). This makes searching for logs easier in Logtree.
   * @param {String?} externalLink if you want to be linked somewhere when you click on this log in Logtree, put that url here. (e.g. maybe you want it to link to a user's dashboard in some 3rd party application).
   */
  public async sendLog(
    content: string,
    folderPath: string,
    referenceId?: string,
    externalLink?: string
  ) {
    try {
      await axios.post(
        SERVER_URL + "/logs",
        {
          content,
          folderPath,
          referenceId,
          externalLink,
        },
        {
          headers: {
            "x-logtree-key": this.publishableApiKey,
            authorization: this.secretKey,
          },
        }
      );
    } catch (e) {
      console.error(e);
    }
  }
}
