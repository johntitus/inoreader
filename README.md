# inoreader
Node.js wrapper for the Inoreader.com API. Based on Promises.

## Installation

`npm install inoreader`

To use:

`var inoreader = require('inoreader')(appId, appKey);`

## Methods

#### .login(userEmail, userPassword)
Logs in as a user and gets a user token from Inoreader. Subsequent calls will reuse the users token, until a new `login` call is made

#### .getUserInfo()
Return information about the currently logged in user.

#### .streamContents(streamId, options)
Grabs items from a stream. Options is a javascript object, with keys matching those found [here](https://www.inoreader.com/developers/stream-contents).

#### .markAllRead(streamId, timeStamp)
Marks item in a stream as read that are older than `timeStamp`. Timestamp is an optional unix timestamp. If omitted, the current time is used.

#### .listSubscriptions()
Returns the current user's list of subscribed feeds.

#### .addSubscription(feedId)
Adds a subscription for the current user to the feed.
