import axios from "axios";
import { NextFunction, Request, Response } from "express";
import UAParser from "ua-parser-js";

const SERVER_URL = "https://logtree-server.onrender.com/api/v1";

type SendLogParams = {
  /**
   * whatever information you want to log to Logtree
   */
  content: string;
  /**
   * folderPath the folderPath of where you want the log to live in Logtree. (e.g. "/transactions/suspicious", "/new-users", etc). This must start with a "/" and not contain any spaces.
   */
  folderPath: string;
  /**
   * some referenceId you want the log to belong to (we recommend you make this the user's email when possible). This makes searching for logs easier in Logtree.
   */
  referenceId?: string;
  /**
   * if you want to be linked somewhere when you click on this log in Logtree, put that url here. (e.g. maybe you want it to link to a user's dashboard in some 3rd party application).
   */
  externalLink?: string;
  /**
   * providing this will autopopulate your logs with relevant context from the request
   */
  req?: Request;
  /**
   * any other additional data you want to record that is relevant to this log
   */
  additionalContext?: Object;
};

export class Logtree {
  publishableApiKey: string;
  secretKey: string;
  shouldLogErrors: boolean;

  /**
   * @constructor creates a Logtree instance
   * @param {String} publishableApiKey your publishable api key (found in the API dashboard tab of the Logtree dashboard)
   * @param {String} secretKey your secret key (generate one in the API dashboard tab of the Logtree dashboard)
   * @param {Boolean} shouldLogErrors (defaults to true) in the event of a Logtree error, this will log the error in your console
   */
  constructor(
    publishableApiKey: string,
    secretKey: string,
    shouldLogErrors: boolean = true
  ) {
    this.publishableApiKey = publishableApiKey;
    this.secretKey = secretKey;
    this.shouldLogErrors = shouldLogErrors;
  }

  /**
   * @description sends a log to Logtree which can be viewed in the Logtree platform.
   * @param {SendLogParams} logDetails
   */
  public async sendLog({
    content,
    folderPath,
    referenceId,
    externalLink,
    req,
    additionalContext,
  }: SendLogParams) {
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
      if (this.shouldLogErrors) {
        console.error(e);
      }
    }
  }

  public recordRouteCall(req: Request, _res: Response, next: NextFunction) {
    // void this.sendLog({
    //   content: `${req.method} ${
    //     req.protocol + "://" + req.hostname + req.originalUrl
    //   }`,
    //   folderPath: "/routes",
    //   req,
    // });
    console.log(req.body)
    next();
  }

  private getRelevantContext(req: Request) {
    const userAgent = UAParser(req.headers["user-agent"]);
    return {
      ...((req as any)["user"] ? { user: (req as any)["user"] } : {}),
      request_sent_from: req.headers.referer,
      request_sent_to: `${req.method} ${
        req.protocol + "://" + req.hostname + req.originalUrl
      }`,
      body: req.body,
      query: req.query,
      params: req.params,
      ...userAgent,
    };
  }
}
