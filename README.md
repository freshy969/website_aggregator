# Joel's website aggregator
<p>This is a project from a Meteor.js course. It is a social aggregator to share interesting websites with different users, vote them, and comment them.</p>

<p>You can try a working instance uploaded here: <a href="http://joel-barba-website-aggregator.meteor.com/">http://joel-barba-website-aggregator.meteor.com</a>

<p>It uses MongoDB to store the data in 3 different collections:</p>
<ul>
  <li><strong>Websites</strong> : { url, title, description, votes_up[*user_id], votes_down[*user_id], count_vup, count_vdw, refs[*webref_id], count_refs }  </li>
  <li><strong>WebRefs</strong> : { url, title, description, website_id, users_rel[*user_id]}</li>
  <li><strong>Recommendations</strong> : { url, title, description, user_id, website_id, webref_id}</li>
</ul>

<p>There's a user system to log in, powered with the meteor.js packages <strong><a href="https://atmospherejs.com/meteor/accounts-ui">accounts-ui</a></strong> and <strong><a href="https://atmospherejs.com/meteor/accounts-password">accounts-password</a></strong>. For more information check out: https://www.meteor.com/accounts</p>
