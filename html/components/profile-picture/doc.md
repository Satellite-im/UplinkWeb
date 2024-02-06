# Profile Picture

Generic profile picture container with options for typing indication, status and highlighting which is useful for indicating voice activity or other CTAs.

## Highlights

It is useful to highlight the profile picture to signify different useful call to actions within the application. The following options are available and should be added as a `class` to the `profile-picture` component.

**Success:** `profile-picture highlight-success`

**Info:** `profile-picture highlight-info`

**Warning:** `profile-picture highlight-warning`

**Danger:** `profile-picture highlight-warning`


## Activity Indication

You can animate an activity bar around the profile picture by adding the `<div class="typing-indicator"></div>` component inside of your profile picture.

## Status Indication

You can indicate the status of a user by including the `<div class="status-indicator online"></div>` and providing a online status. The available statuses are as follows.

**Online:** `status-indicator online`

**Offline:** `status-indicator offline`

**Idle:** `status-indicator idle`

**Do Not Disturb:** `status-indicator do-not-disturb`

## Notification Badge

A notification badge which also includes a number to represent the count of notifications can be applied by adding the `<label class="badge">3</label>` component.