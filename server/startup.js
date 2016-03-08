// start up function that creates entries in the Websites databases.
Meteor.startup(function () {
    // code to run on server at startup
    if (!Websites.findOne()){
        console.log("No websites yet. Creating starter data.");
          Websites.insert({
            title       : "Goldsmiths Computing Department", 
            url         : "http://www.gold.ac.uk/computing/", 
            description : "This is where this course was developed.", 
            createdOn   : new Date(),
            createdBy   : 'nobody',
            votes_up    : [],
            votes_down  : [],
            count_vup   : 0,
            count_vdw   : 0,
            refs        : [],
            count_refs  : 0
        });
         Websites.insert({
            title       : "University of London", 
            url         : "http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route", 
            description : "University of London International Programme.", 
            createdOn   : new Date(),
            createdBy   : 'nobody',
            votes_up    : [],
            votes_down  : [],
            count_vup   : 0,
            count_vdw   : 0,
            refs        : [],
            count_refs  : 0
        });
         Websites.insert({
            title       : "Coursera", 
            url         : "http://www.coursera.org", 
            description : "Universal access to the world’s best education.", 
            createdOn   : new Date(),
            createdBy   : 'nobody',
            votes_up    : [],
            votes_down  : [],
            count_vup   : 0,
            count_vdw   : 0,
            refs        : [],
            count_refs  : 0
        });
        Websites.insert({
            title       : "Google", 
            url         : "http://www.google.com", 
            description : "Popular search engine.", 
            createdOn   : new Date(),
            createdBy   : 'nobody',
            votes_up    : [],
            votes_down  : [],
            count_vup   : 0,
            count_vdw   : 0,
            refs        : [],
            count_refs  : 0
        });
        Websites.insert({
            title       : "El Blog del Barba", 
            url         : "https://blogdelbarba.wordpress.com/", 
            description : "This is a very interesting blog page.", 
            createdOn   : new Date(),
            createdBy   : 'nobody',
            votes_up    : [],
            votes_down  : [],
            count_vup   : 0,
            count_vdw   : 0,
            refs        : [],
            count_refs  : 0
        });

    }
    
    Meteor.methods({
	  get_website_info_by_http: function (website_url) {
          console.log('get_website_info_by_http -> (' + website_url + ')');
          var resp = HTTP.call('GET', website_url, {});
          return resp;
	  }
    });
    
    
    // Website references generator (Looks for similar webs on google search engine)
    Meteor.setInterval(function() {
        // Get the up voted websites
        var cur = Websites.find( {},
                                 { sort  : { count_refs: 1, count_vup: -1 }, 
                                   limit : 1 }
                                );
        generate_webrefs(cur.fetch()[0]);
    }, 5 * 60 * 1000);  // Every 5 minutes
    
    
    
    // Recommendation engine
    Meteor.setInterval(function() {
        console.log('Regenerate recommendations');
        
        // For each user
        Accounts.users.find({}).forEach(function(usr) {
            console.log('USR: ' + usr.username);
            
            // Get the user recommendations count
            var count_refs = Recommendations.find({user_id: usr._id}).count();
            console.log('count refs = ' + count_refs);
        
            // Attatch refs for created websites
            if (count_refs < 10) {  // Max 10 refs per user
                Websites.find({ createdBy: usr._id }).forEach(function(web) {
                    set_references_web_user(usr, web, count_refs);
                }); // Websites forEach end
            }
            
            // Attatch refs for voted up websites
            if (count_refs < 10) {  // Max 10 refs per user
                Websites.find({ votes_up: usr._id }).forEach(function(web) {
                    set_references_web_user(usr, web, count_refs);
                }); // Websites forEach end
            }
            
            // Attatch refs for commented websites
            if (count_refs < 10) {  // Max 10 refs per user
                Websites.find({}).forEach(function(web) {
                    if (Comments.getCollection().find(
                        { $and: [ { referenceId: web._id}, 
                                  { userId: usr._id}] 
                        }).count() > 0) set_references_web_user(usr, web, count_refs);
                }); // Websites forEach end
            }            
            
        }); // users forEach end
        
    }, 5 * 60 * 1000);  // Every 5 minutes
        
    
    console.log('Initialized');
    
});