# Joel's website aggregator
This is a project from a Meteor.js course. It is a social aggregator to share interesting websites with different users, vote them, and comment them.

You can try a working instance uploaded here: [http://joel-barba-web-aggregator.meteorapp.com/](http://joel-barba-web-aggregator.meteorapp.com/).

It uses MongoDB to store the data in 3 different collections:

* <strong>Websites</strong> : { url, title, description, votes_up[*user_id], votes_down[*user_id], count_vup, count_vdw, refs[*webref_id], count_refs }
* <strong>WebRefs</strong> : { url, title, description, website_id, users_rel[*user_id]}
* <strong>Recommendations</strong> : { url, title, description, user_id, website_id, webref_id}

## Loggin
There's a user system to log in, powered with the meteor.js packages <strong><a href="https://atmospherejs.com/meteor/accounts-ui">accounts-ui</a></strong> and <strong><a href="https://atmospherejs.com/meteor/accounts-password">accounts-password</a></strong>. For more information check out: https://www.meteor.com/accounts

## Posting
Every logged user can add new websites to the list. Clicking to the right button, a form is expanded and you can fill it with the url and some information.

An automatic feature is triggered after typing an url. It launches an http request to the url, gets some meta information about it, and display this data as a suggestion to fill the other form fields.

Only the owner of the post can edit or delete it.

To avoid loading the whole list of posts, there's an infinit scroll so more posts will be loaded as you scroll the page down.

## Voting
Every logged user can vote up or down each website (one vote per user per website). The most voted up websites will appear first in the list.

## Comments
Clicking on the _Info_ button of each website, you'll go to a detail page, where you can see the post information and also can read and add comments. To add comments you must be logged as a valid user.

The comment system is powered by the [arkham:comments-ui](https://atmospherejs.com/arkham/comments-ui) atmosphere package.

## Background
There's a background proces which, based on user information, generate different website recommendations. It looks for posted websites, voted up and commented websites, to launch an http request to a Google Search Engine, and get back similar websites in order to generate recommendations that will be displaying at the right side of the page, personalized for each user.


## About it
This is the [final task](https://www.coursera.org/learn/meteor-development/peer/aRIRG/build-a-social-website-aggregator) of the ["Introduction to Meteor.js development"](https://www.coursera.org/learn/meteor-development/) online course, served on [Coursera](https://www.coursera.org), and taught by [University of London](http://www.londoninternational.ac.uk/).

