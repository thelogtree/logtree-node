import axios from "axios";
import { NextFunction, Request, Response } from "express";
import UAParser from "ua-parser-js";

const SERVER_URL = "https://logtree-server.onrender.com/api/v1";

export class Logtree {
  publishableApiKey: string;
  secretKey: string;

  constructor(publishableApiKey: string, secretKey: string) {
    this.publishableApiKey = publishableApiKey;
    this.secretKey = secretKey;
  }

  /**
   * @description use as middleware. this will record any requests to your server in logtree.
   */
  public recordRouteCalls(req: Request, _res: Response, next: NextFunction) {
    console.log("starting")
    const folderPath = "/route-calls" + req.path;
    void this.sendLog(
      `${req.method} ${req.protocol + "://" + req.hostname + req.originalUrl}`,
      folderPath,
      undefined,
      undefined,
      req
    );
    console.log("ending")
    next();
  }

  /**
   * @description sends a log to Logtree which can be viewed in the Logtree platform.
   * @param {String} content whatever information you want to log to Logtree
   * @param {String} folderPath the folderPath of where you want the log to live in Logtree. (e.g. "/transactions/suspicious", "/new-users", etc.)
   * This must start with a "/" and not contain any spaces.
   * @param {String?} referenceId some referenceId you want the log to belong to (we recommend you make this the user's email when possible). This makes searching for logs easier in Logtree.
   * @param {String?} externalLink if you want to be linked somewhere when you click on this log in Logtree, put that url here. (e.g. maybe you want it to link to a user's dashboard in some 3rd party application).
   * @param {Request?} req providing this will autopopulate your logs with context from the request
   * @param {Object?} additionalContext any other additional data you want to record that is relevant to this log
   */
  public async sendLog(
    content: string,
    folderPath: string,
    referenceId?: string,
    externalLink?: string,
    req?: Request,
    additionalContext?: Object
  ) {
    try {
      let cleanedContext;
      if (req) {
        cleanedContext = this.getRelevantContext(req);
      }
      if (additionalContext) {
        cleanedContext = {
          ...additionalContext,
          ...cleanedContext,
        };
      }
      await axios.post(
        SERVER_URL + "/logs",
        {
          content,
          folderPath,
          referenceId,
          externalLink,
          additionalContext: cleanedContext,
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

  private getRelevantContext(req: Request) {
    const userAgent = UAParser(req.headers["user-agent"]);
    return {
      url: `${req.method} ${
        req.protocol + "://" + req.hostname + req.originalUrl
      }`,
      body: JSON.stringify(req.body),
      query: JSON.stringify(req.query),
      params: JSON.stringify(req.params),
      ...userAgent,
    };
  }
}
