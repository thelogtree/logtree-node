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
MyLogtree.sendLog("The user just performed some action!", "/actions") 
```
