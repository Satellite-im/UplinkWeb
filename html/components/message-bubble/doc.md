# Message Bubble

Generic message bubble with support for local and remote designs (sender / reciever).

The messages are grouped so that the border radius matches up to show that a collection of messages are grouped together. They also support highlighting to call action to the message for different reasons.

I try not to do too much in this component to keep it from becoming overly complex. It will likely be acompanied in most cases inside a message layout which includes things like profile pictures and more. However I do think this is a proper place to handle the display of reactions.

## Highlights

**Success:** `highlight-success`

**Info:** `highlight-info`

**Warning:** `highlight-warning`

**Error:** `highlight-error`

## Remote vs Not Remote

The default message is intended to be what the message coming from you will look like. If you want to signify that the message is coming from a 3rd party you should apply the remote class. This class is also applied to the message group but in more capable UI frameworks than pure HTML & CSS it should probably be a prop or something.

## Replies

Applying the reply class is a precursor to the work I plan to have contained in the message layout, however some changes can be done to make the reply stand out more as a reply than just another message, those I handle here.