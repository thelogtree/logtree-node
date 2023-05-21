# Logtree NodeJS package

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
MyLogtree.sendLog("Some user just joined my waitlist!", "/waitlist") 
```

## sendLog details
The `sendLog` function takes the following parameters in order:
```
@param {String} content whatever information you want to log to Logtree
@param {String} folderPath the folderPath of where you want the log to live in Logtree. (e.g. "/transactions/suspicious", "/new-users", etc.)
This must start with a "/" and not contain any spaces.
@param {String?} referenceId some referenceId you want the log to belong to (we recommend you make this the user's email when possible). This makes searching for logs easier in Logtree.
@param {String?} externalLink if you want to be linked somewhere when you click on this log in Logtree, put that url here. (e.g. maybe you want it to link to a user's dashboard in some 3rd party application).
@param {Request?} req providing this will autopopulate your logs with context from the request
@param {Object?} additionalContext any other additional data you want to record that is relevant to this log
```
In the example above, you can see that we decided to only send the `content` and the `folderPath` of the log.

## Your logs will be viewable and searchable in the Logtree dashboard
<img width="283" alt="Screenshot 2023-05-18 at 4 54 19 PM" src="https://github.com/thelogtree/logtree-node/assets/62567315/284cc140-6201-4089-b402-1d9fe60f2070">
