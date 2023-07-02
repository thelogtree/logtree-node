# Logtree NodeJS package

This package is only available to people who already have a Logtree account. You can learn more about Logtree and sign up for free [here.](https://trylogtree.com)

## How to install the package

If you're using yarn:

```
yarn add logtree-node
```

If you're using npm:

```
npm install logtree-node
```

## How to send an event to Logtree

```
import { Logtree } from "logtree-node";

// you can find these keys in the API Dashboard tab in Logtree.
const MyLogtree = new Logtree(your_publishable_api_key, your_secret_key)

// send an event
MyLogtree.sendEvent({ content: "Some user just joined my waitlist!", folderPath: "/waitlist" })
```

## sendEvent details

The `sendEvent` function takes in an object of type SendEventParams with the following fields:

```
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
   * some referenceId you want the event to belong to (we recommend you make this the user's email address when possible). This makes searching for events easier in Logtree.
   */
  referenceId?: string;
  /**
   * if you want to be linked somewhere when you click on this event in Logtree, put that url here. (e.g. maybe you want it to link to a user's dashboard in some 3rd party application).
   */
  externalLink?: string;
  /**
   * providing this will autopopulate your events with relevant context from the request.
   * info that will be autopopulated includes: req.user, user-agent header, the method and url of the request, etc
   */
  req?: Request;
  /**
   * any other additional data you want to record that is relevant to this event
   */
  additionalContext?: Object;
};
```

In the example above, you can see that we decided to only send the `content` and the `folderPath` of the event. Note that if Logtree were to ever error out (say you exceeded your account's monthly event limit), we'll automatically catch the error for you if you use this package, but won't catch it if you send the event over regular HTTP instead of using this package.

## sendDebugLog details

The `sendDebugLog` function takes in a string as the first argument (whatever you want to log) and optionally the express request as the second argument. If the request is provided, we'll autopopulate additional context to the log about the request details.

This function is meant for quick debugging purposes as an alternative to console.log(""). Logs sent with the sendDebugLog function will appear in the /debugging channel in Logtree.

## sendError details

The `sendError` function takes in an object of type SendErrorParams with the following fields:

```
type SendErrorParams = {
  /**
   * the error you want to send to Logtree
   */
  error: Error | AxiosError;
  /**
   * some referenceId you want the error to belong to (we recommend you make this the user's email address when possible). This makes searching for errors easier in Logtree.
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
```

Errors sent with the sendError function will appear in the /errors channel in Logtree.

## Your events will be viewable and searchable in the Logtree dashboard

<img width="283" alt="Screenshot 2023-05-18 at 4 54 19 PM" src="https://github.com/thelogtree/logtree-node/assets/62567315/284cc140-6201-4089-b402-1d9fe60f2070">
