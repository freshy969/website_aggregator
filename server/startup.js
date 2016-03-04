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
        count_vdw   : 0
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
        count_vdw   : 0
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
        count_vdw   : 0
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
        count_vdw   : 0
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
        count_vdw   : 0
    });
    
}
});