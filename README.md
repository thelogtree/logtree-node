# Logtree NodeJS package

This package is only available to people who already have a Logtree account. You can learn more about Logtree and sign up for free [here.](https://logtree.co)

## How to install the package

If you're using yarn:

```
yarn add logtree-node
```

If you're using npm:

```
npm install logtree-node
```

## How to send a log to Logtree

```
import { Logtree } from "logtree-node";

// you can find these keys in the API Dashboard tab in Logtree.
const MyLogtree = new Logtree(your_publishable_api_key, your_secret_key)

// send a log
MyLogtree.sendLog({ content: "Some user just joined my waitlist!", folderPath: "/waitlist" })

// send a log for quick debugging purposes
MyLogtree.sendDebugLog("got here")
```

## sendLog details

The `sendLog` function takes in an object of type SendLogParams with the following fields:

```
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
   * providing this will autopopulate your logs with relevant context from the request.
   * info that will be autopopulated includes: req.user, user-agent header, the method and url of the request, etc
   */
  req?: Request;
  /**
   * any other additional data you want to record that is relevant to this log
   */
  additionalContext?: Object;
};
```

In the example above, you can see that we decided to only send the `content` and the `folderPath` of the log. Note that if Logtree were to ever error out (say you exceeded your account log limit), we'll automatically catch the error for you if you use this package.

## sendDebugLog details

The `sendDebugLog` function takes in a string as the first argument (whatever you want to log) and optionally the express request as the second argument. If the request is provided, we'll autopopulate additional context to the log about the request details.

This function is meant for quick debugging purposes as an alternative to console.log(""). Logs sent with the sendDebugLog function will appear in the /debugging channel in Logtree.

## sendErrorLog details

The `sendErrorLog` function takes in an error as the first argument and optionally the express request as the second argument. If the request is provided, we'll autopopulate additional context to the log about the request details.

Error logs sent with the sendErrorLog function will appear in the /errors channel in Logtree.

## Your logs will be viewable and searchable in the Logtree dashboard

<img width="283" alt="Screenshot 2023-05-18 at 4 54 19 PM" src="https://github.com/thelogtree/logtree-node/assets/62567315/284cc140-6201-4089-b402-1d9fe60f2070">
