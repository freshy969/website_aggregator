shared_fun = function() {
    if (Meteor.isServer) {
        console.log('exe shared_fun (server)');
    }
    
    if (Meteor.isClient) {
        console.log('exe shared_fun (client)');        
    }
};




generate_webrefs = function(website) {
    if (Meteor.isClient) console.log('CLIENT Generate webrefs');
    if (Meteor.isServer) console.log('SERVER Generate webrefs');
    
    if (website.count_refs >= 5) {
        console.log('No refs to generate');
        return 0;
    } else {
        
        // Here we should put the logic to generate new inputs
        if (Meteor.isClient) var APIkey = 'AIzaSyCcWBpihaXBjuJTf-B8cgNn1z6xjd2HiRg';  // Client Key
        if (Meteor.isServer) var APIkey = 'AIzaSyAAHTcGy6rVFOrEHAXml2PgjEmh7jOqN4Y';  // Server Key
        var cx = '014266877416681023404:ru4_rxoq9wq';
        var search = website.title.replace(/ /g, "%20");
        console.log('HTTP search -> ' + search);

        var response = HTTP.call(
            'GET', 'https://www.googleapis.com/customsearch/v1?key=' + APIkey
           + '&cx=' + cx 
           + '&q=' + search, {}, function(err, response) {
        
                if (response.statusCode == 200) {
                    var max_refs = 5;

                    for (var t = 0; t < response.data.items.length; t++) {

                        var new_webref = {                    
                            url         : response.data.items[t].link,
                            title       : response.data.items[t].title,
                            description : response.data.items[t].snippet.substr(0, 300),
                            website_id  : website._id,
                            users_rel   : []
                        }
//                        console.log(new_webref);
                        if (website.count_refs < 5) { // 5 refs max per website
                            
                            if (new_webref.url.indexOf(website.url) != -1) { // check this is not the same url (or root)
                                console.log('Loop reference (not insert): ' + new_webref.url + ' <-> ' + website.url);
                            } else {
                                // Check the ref does not exist (in the website ref list)
                                if (WebRefs.findOne( { $and: [ { website_id: new_webref.website_id }, { url: new_webref.url } ] }) ) {
                                    console.log('Existing reference (not insert): ' + new_webref.url + ' <-> ' + website.url);
                                } else {
                                    console.log('Insert reference: ' + new_webref.url);
                                    var webref_id = WebRefs.insert(new_webref);

                                    // Update the Website references
                                    website.count_refs++;
                                    Websites.update(
                                                {_id: website._id}, 
                                                { $push: { refs : webref_id }, $inc: { count_refs: 1 } }
                                            );

                                }
                            }
                        }
                    }
                } else {
                    console.log('Error response.statusCode = ' + response.statusCode);
                }
               
           } // end http callback function
        );
  
    }
    
    return 0;

}

set_references_web_user = function(usr, web, count_refs) {
    console.log('website: ' + web.title + '(id: ' + web._id + ')');
    console.log('usr._id: ' + usr._id);

    // Get the references of the website, where the user is not linked in
    WebRefs.find(
      { $and: [{ website_id: web._id }, 
               { $where: '(this.users_rel.indexOf("' + usr._id + '") == -1)'} ]
      } 
    ).forEach(function(ref) {
        if (count_refs < 10) create_recommendation(usr, web, ref);
    }); // WebRef forEach end
}


create_recommendation = function(usr, web, ref) {

    var new_rec = {
        user_id     : usr._id, 
        website_id  : web._id,
        webref_id   : ref._id,
        title       : ref.title,
        url         : ref.url,
        description : ref.description
    }
    console.log('create_recommendation -> ' + new_rec.title + ' to ' + usr.username
//                + 'user_id = '    + new_rec.user_id
//                + 'website_id = ' + new_rec.website_id
//                + 'webref_id = '  + new_rec.webref_id
//                + 'title = '      + new_rec.title
               );
    var rec_id = Recommendations.insert(new_rec);
    new_rec._id = rec_id;
    
    // Set the link user into the WebRefs array
    WebRefs.update(
        {_id: new_rec.webref_id }, 
        { $push: { users_rel: usr._id }}
    );
                
}


/*

set_recommendations = function(usr) {
    
    // Get the up voted websites
    var cur = Websites.find( { votes_up  : { $all: [usr._id] }} );
    cur.forEach(function(elem) { 

        // Here we should put the logic to generate new inputs
        if (Meteor.isClient) var APIkey = 'AIzaSyCcWBpihaXBjuJTf-B8cgNn1z6xjd2HiRg';  // Client Key
        if (Meteor.isServer) var APIkey = 'AIzaSyD1N080obsszNU5pQvXLrpn07tO97k2gZQ'; // Server Key
        var cx = '014266877416681023404:ru4_rxoq9wq';
        var search = elem.title.replace(/ /g, "%20");  // convert space characters
        console.log('HTTP search -> ' + search);

        for (var t = 0; t < response.data.items.length; t++) {
            var new_rec = {
                user_id     : usr._id, 
                website_id  : 0,
                title       : response.data.items[t].title,
                url         : response.data.items[t].link,
                description : response.data.items[t].snippet.substr(0, 300)
            }
            console.log(new_rec);
            if (Recommendations.findOne( { $and: [ { user_id: usr._id }, { url: elem.url }] })) {
                // In this case, the recomendation exists
            } else {
                Recommendations.insert(new_rec);
                count++;
            }
        }              

    });
}


generate_webrefs = function() {

    // Get the up voted websites
    var cur = Websites.find( { votes_up  : { $all: [usr._id] }} );
    cur.forEach(function(elem) { 

        // Here we should put the logic to generate new inputs
        if (Meteor.isClient) var APIkey = 'AIzaSyCcWBpihaXBjuJTf-B8cgNn1z6xjd2HiRg';  // Client Key
        if (Meteor.isServer) var APIkey = 'AIzaSyD1N080obsszNU5pQvXLrpn07tO97k2gZQ'; // Server Key
        var cx = '014266877416681023404:ru4_rxoq9wq';
        var search = elem.title.replace(/ /g, "%20");
        console.log('HTTP search -> ' + search);

        HTTP.call( 'GET', 'https://www.googleapis.com/customsearch/v1?key=' + APIkey
                           + '&cx=' + cx 
                           + '&q=' + search, {}, function( error, response ) {
          if ( error ) {
            console.log( error );
          } else {
//                    console.log( response );

            for (var t = 0; t < response.data.items.length; t++) {
                var new_rec = {
                    user_id     : usr._id, 
                    title       : response.data.items[t].title,
                    url         : response.data.items[t].link,
                    description : response.data.items[t].snippet.substr(0, 300)
                }
                console.log(new_rec);
                if (Recommendations.findOne( { $and: [ { user_id: usr._id }, { url: elem.url }] })) {
                    // In this case, the recomendation exists
                } else {
                    Recommendations.insert(new_rec);
                    count++;
                }
            }
          }
        });                

    });
    
    
    return 0;

}



/*
function set_recommendations() {
    console.log('set_recommendations ini');
    
    if (Meteor.user()) {
        
    // get user -> Accounts.users.findOne({ _id: 'wLSv7kQvJYZDzrwkk'})
    // get comment -> Comments.getCollection().findOne({});
    // get comment -> Comments.getCollection().find({ userId: 'mBREFHzjnjBm4ytTz'}).fetch();
    
        // Get the up voted websites
        var cur = Websites.find( { votes_up  : { $all: [Meteor.user()._id] }} );

        cur.forEach(function(elem) { 
            console.log(elem.title + ', ' + elem.url);
            Recommendations.insert({
                user_id     : Meteor.user()._id, 
                title       : elem.title, 
                url         : elem.url, 
                description : elem.description
            });        
        });
        
    }
    

    
//    Recommendations.insert({
//        user_id     : 'FZgEwhZt9kR9r6D5f', 
//        title       : "Coursera2", 
//        url         : "http://www.coursera.org", 
//        description : "Universal access to the world’s best education."
//    });
//    Recommendations.insert({
//        user_id     : 'FZgEwhZt9kR9r6D5f', 
//        title       : "google.es", 
//        url         : "http://www.google.es", 
//        description : "The spanish google site"
//    });
//    Recommendations.insert({
//        user_id     : 'FZgEwhZt9kR9r6D5f', 
//        title       : "google.cat", 
//        url         : "http://www.google.cat", 
//        description : "The catalan google site"
//    });
    //        Recommendations.update({_id:'PxRYrWtRABWBETS83'}, { $set: { user_id: 'mBREFHzjnjBm4ytTz' }});
    console.log('set_recommendations fi');
}*/