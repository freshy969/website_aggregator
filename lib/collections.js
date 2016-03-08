Websites = new Mongo.Collection("websites");
Recommendations = new Mongo.Collection("recommendations");
WebRefs = new Mongo.Collection("webrefs");



// set up security on Websites collection
Websites.allow({

	update: function(website_id, doc) {
        console.log(doc);
		if (Meteor.user())  return true;
		return false;
	},

	insert: function(website_id, doc) {
		if (Meteor.user())  return true;
        return false;
	}, 
	remove: function(website_id, doc) {
		if (Meteor.user())  return true;
		return false;
	}
});


// set up security on Recommendations collection
Recommendations.allow({

	update: function(website_id, doc) {
		if (Meteor.user())  return true;
		return false;
	},

	insert: function(website_id, doc) {
		if (Meteor.user())  return true;
        return false;
	}, 
	remove: function(website_id, doc) {
		if (Meteor.user())  return true;
		return false;
	}
});


// set up security on WebRefs collection
WebRefs.allow({

	update: function(webref_id, doc) { return true; },
	insert: function(webref_id, doc) { return true; }, 
	remove: function(webref_id, doc) { return true; }
});









