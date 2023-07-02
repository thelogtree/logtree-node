import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { Server } from 'http';
import _ from 'lodash';
import StackTrace from 'stacktrace-js';
import UAParser from 'ua-parser-js';

const SERVER_URL = "https://logtree-server.onrender.com/api/v1";

type SendEventParams = {
  /**
   * whatever information you want to send to Logtree
   */
  content: string;
  /**
   * folderPath the folderPath of where you want the event to live in Logtree. (e.g. "/transactions/suspicious", "/new-users", etc). This must start with a "/" and not contain any spaces.
   */
  folderPath: string;
  /**
   * some referenceId you want the event to belong to (we recommend you make this the user's email address when possible). This makes searching for logs easier in Logtree.
   */
  referenceId?: string;
  /**
   * if you want to be linked somewhere when you click on this event in Logtree, put that url here. (e.g. maybe you want it to link to a user's dashboard in some 3rd party application).
   */
  externalLink?: string;
  /**
   * providing this will autopopulate your events with relevant context from the request
   */
  req?: Request;
  /**
   * any other additional data you want to record that is relevant to this event
   */
  additionalContext?: Object;
};

type SendErrorParams = {
  /**
   * the error you want to log to Logtree
   */
  error: Error | AxiosError;
  /**
   * some referenceId you want the error to belong to (we recommend you make this the user's email address when possible). This makes searching for logs easier in Logtree.
   */
  referenceId?: string;
  /**
   * providing this will autopopulate your errors with relevant context from the request (like the stacktrace)
   */
  req?: Request;
  /**
   * any other additional data you want to record that is relevant to this error
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
   * @param {SendEventParams} logDetails
   * @deprecated use sendEvent instead. sendLog will be removed soon.
   */
  public async sendLog({
    content,
    folderPath,
    referenceId,
    externalLink,
    req,
    additionalContext,
  }: SendEventParams) {
    try {
      let cleanedContext;
      if (req) {
        cleanedContext = this.getRelevantContext(req);
      }
      if (
        additionalContext &&
        JSON.stringify(additionalContext).length < 1700
      ) {
        cleanedContext = {
          ...additionalContext,
          ...cleanedContext,
        };
      } else if (additionalContext) {
        cleanedContext = {
          logtree_message:
            "additionalContext not recorded because it is too long",
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

    /**
   * @description sends an event to Logtree which can be viewed in the Logtree platform.
   * @param {SendEventParams} eventDetails
   */
     public async sendEvent({
      content,
      folderPath,
      referenceId,
      externalLink,
      req,
      additionalContext,
    }: SendEventParams) {
      try {
        let cleanedContext;
        if (req) {
          cleanedContext = this.getRelevantContext(req);
        }
        if (
          additionalContext &&
          JSON.stringify(additionalContext).length < 1700
        ) {
          cleanedContext = {
            ...additionalContext,
            ...cleanedContext,
          };
        } else if (additionalContext) {
          cleanedContext = {
            logtree_message:
              "additionalContext not recorded because it is too long",
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

  /**
   * @description sends a log to Logtree for quick debugging purposes. this function has simpler syntax for quick implementation, but capability is limited.
   * logs from this function will appear in the /debugging channel in Logtree.
   * @param {String} content whatever information you want to log to Logtree
   * @param {Request?} req providing this will autopopulate your logs with relevant context from the request
   */
  public async sendDebugLog(content: string, req?: Request) {
    try {
      let cleanedContext;
      if (req) {
        cleanedContext = this.getRelevantContext(req);
      }

      await axios.post(
        SERVER_URL + "/logs",
        {
          content,
          folderPath: "/debugging",
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

  /**
   * @description sends an error to Logtree which will be stored in a /errors channel.
   * @param {SendErrorParams} logDetails
   */
  public async sendError({
    error,
    referenceId,
    req,
    additionalContext,
  }: SendErrorParams) {
    try {
      let cleanedContext;
      if (req) {
        cleanedContext = this.getRelevantContext(req);
      }
      if (
        additionalContext &&
        JSON.stringify(additionalContext).length < 1700
      ) {
        cleanedContext = {
          ...additionalContext,
          ...cleanedContext,
        };
      } else if (additionalContext) {
        cleanedContext = {
          logtree_message:
            "additionalContext not recorded because it is too long",
          ...cleanedContext,
        };
      }
      const stacktraceInfo = await StackTrace.fromError(error);

      let stacktrace = "";
      stacktraceInfo.forEach((trace) => {
        stacktrace += "\n";
        stacktrace += `${trace.fileName} (line ${trace.lineNumber})`;
      });

      cleanedContext = {
        stacktrace,
        ...cleanedContext,
      };
      const proposedError = _.get(error, "response.data", error.message);
      const stringifiedError =
        typeof proposedError === "string"
          ? proposedError
          : JSON.stringify(proposedError);

      await axios.post(
        SERVER_URL + "/logs",
        {
          content: stringifiedError,
          folderPath: "/errors",
          additionalContext: cleanedContext,
          referenceId,
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

  /**
   * @description sets up monitors instantly and automatically
   * @param {Server} server the node http server
   */
  public startMonitoring(server: Server) {
    server.on("request", async (req, res) => {
      console.log("hit endpoint " + req.url);
      try {
        await axios.post(
          SERVER_URL + "/track",
          {
            path: req.url,
          },
          {
            headers: {
              "x-logtree-key": this.publishableApiKey,
              authorization: this.secretKey,
            },
          }
        );
      } catch {
        // swallow any Logtree error silently
      }
      req.on("error", async (error) => {
        console.error(error.message);
        try {
          await axios.post(
            SERVER_URL + "/track",
            {
              path: req.url,
              errorCode: res.statusCode?.toString() || "500",
            },
            {
              headers: {
                "x-logtree-key": this.publishableApiKey,
                authorization: this.secretKey,
              },
            }
          );
        } catch {
          // swallow any Logtree error silently
        }
      });
    });
  }

  private getRelevantContext(req: Request) {
    const userAgent = UAParser(req.headers["user-agent"]);
    return {
      request_sent_from: req.headers.referer,
      request_sent_to: `${req.method} ${
        req.protocol + "://" + req.hostname + req.originalUrl
      }`,
      body: JSON.stringify(req.body).length > 500 ? "too long" : req.body,
      query: JSON.stringify(req.query).length > 500 ? "too long" : req.query,
      params: JSON.stringify(req.params).length > 500 ? "too long" : req.body,
      ...userAgent,
    };
  }
}
