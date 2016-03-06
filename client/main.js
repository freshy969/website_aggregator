
/// Routing config
Router.configure({
  layoutTemplate: 'Main_template'
});

Router.route('/', function () {
  this.render('navbar', { to : "navbar" });    
  this.render('welcome_screen', { to : "main" });
});

Router.route('/principal', function () {
  this.render('navbar', { to : "navbar" });    
  this.render('principal_screen', { to : "main" });
}, { name : "prin" });

Router.route('/website/:_id', function () {
  this.render('navbar', { to : "navbar" });    
  this.render('detail_screen', { 
      to : "main",
      data : function() {
        return Websites.findOne( { _id: this.params._id} );
      }
  });
}, { name : "det" });



/// Accounts config
Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_EMAIL"
});


/// Infinite scroll config
Session.set("itemsLimit", 6);
lastScrollTop = 0; 
$(window).scroll(function(event) { // test if we are near the bottom of the window
    if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
        
        var scrollTop = $(this).scrollTop();  // page position
        // test if we are going down, and add items in this case
        if (scrollTop > lastScrollTop)  Session.set("itemsLimit", Session.get("itemsLimit") + 4);
        lastScrollTop = scrollTop;
    }
});




/// Comments template config
Comments.ui.config({
   template: 'bootstrap'
});


/////
// template helpers 
/////

Template.body.helpers({
  username:function(){
    if (Meteor.user()) {
      return Meteor.user().username;
    } else {
      return "anonymous internet user";
    }
  }
});


// helper function for the navbar
Template.navbar.helpers({
    isThisRoute: function(route_name) {
        return (Router.current().route.getName() == route_name);   
    },
    filterActive: function(){
      if (Session.get("listFilter")) return true;
      else                           return false;
    }
});


// helper function that returns all available websites
Template.website_list.helpers({
    websites:function() {
        if (Session.get("listFilter")) {
            return  Websites.find(
                { $or: [ { title       : { $regex: Session.get("listFilter"), $options: 'i' } },
                         { description : { $regex: Session.get("listFilter"), $options: 'i' } }
                       ] 
                },
                { sort  : { count_vup: -1, count_vdw: 1 }, 
                  limit : Session.get("itemsLimit")}
            );
        } else {
            return Websites.find(
                {},
                { sort  : { count_vup: -1, count_vdw: 1 }, 
                  limit : Session.get("itemsLimit")}
            );
        }
        
//        return Websites.collection.aggregate([
//            { $unwind: "votes_up"}, 
//            { $group: {_id:"$_id", votes_up: {$push:"votes_up"}, size: {$sum:1}}}, 
//            { $sort:{size:1}}
//        ]);
    }
});



// helper functions for each item in the list
Template.website_item.helpers({
    prettifyDate: format_date,
    getUser: user_name,
    votedUp: function() {
        return (test_user_vote(this._id, Meteor.user()._id) == 1);
    },    
    votedDown: function() {
        return (test_user_vote(this._id, Meteor.user()._id) == -1);
    },
    isOwner: function(ownerId) {
        return (Meteor.user()._id == ownerId);
    }
});


// helper functions for detail screen
Template.detail_screen.helpers({
    prettifyDate: format_date,
    getUser: user_name,
    userVote: function() {
        var vote = test_user_vote(this._id, Meteor.user()._id);
        if (vote == 1)  return '<span class="label label-success">Up</span>';
        if (vote == -1) return '<span class="label label-danger">Down</span>';
        return '<span class="label label-default">No vote</span>';;
    }
});

/////
// template events 
/////

// Return 1: if there's an up vote, 0: no vote, -1: down vote
function test_user_vote(website_id, user_id) {
    if (Websites.findOne( { _id: website_id, votes_up  : { $all: [user_id] }} ) ) { return 1; }
    if (Websites.findOne( { _id: website_id, votes_down: { $all: [user_id] }} ) ) { return -1; }
    return 0;
}

function format_date(ts) {
    var month = ts.getMonth() + 1;
    return ts.getDate() + '-' + month + '-' + ts.getFullYear()
           + ' ' + ts.getHours() + ':' + ts.getMinutes() + ':' + ts.getSeconds();
}

function user_name(user_id) {
  var user = Meteor.users.findOne({_id:user_id});
  if (user){
    return user.username;
  } else {
    return 'nobody';
  }
}

function get_web_info() {
    alert('ee');
    HTTP.call("POST", "http://api.twitter.com/xyz", // "http://docs.meteor.com/",
          function (error, result) {
            console.log(result);
            alert ('res');
          });
}



    


Template.navbar.events({
    "submit .js-set-item-filter": function(event) { // Set filter to the list
        console.log('js-set-item-filter -> ' + event.target.filtertext.value);        
        Session.set("listFilter", event.target.filtertext.value);
        return false;
    },
    "click .js-remove-filter": function(event) {
        Session.set("listFilter", undefined);
        $('[name=filtertext]').val("");
        return false;
    }
});

Template.website_add_new.events({
    "click .js-get-web-info": function(event) { get_web_info(); }
});
    
Template.website_item.events({
    "click .js-upvote": function(event) {
        var website_id = this._id;
        
        if (Meteor.user()) {    // Only logged users can vote

            var user_id = Meteor.user()._id;

            // Test if the user exist in the vote array
            var vote = test_user_vote(website_id, user_id);
            console.log('The user voted before:' + vote + ', webid: ' + website_id);

            // Change vote from down to up
            if (vote == -1) Websites.update( {_id: website_id},  { $pull: { votes_down: user_id }, $inc: { count_vdw: -1 } } );

            // Unvote
            if (vote == 1)  Websites.update( {_id: website_id},  { $pull: { votes_up: user_id }, $inc: { count_vup: -1 } } );

            if (vote != 1) {    // Inser vote only if it doesn't exist
                Websites.update(
                            {_id: website_id}, 
                            { $push: { votes_up: user_id }, $inc: { count_vup: 1 } }
                        );
            }
        } else {
            $('#must_log_warning_' + website_id).show();
        }
        return false; // prevent the button from reloading the page
    }, 
        
    "click .js-downvote": function(event) {
        var website_id = this._id;

        if (Meteor.user()) {    // Only logged users can vote
            
            var user_id = Meteor.user()._id;

            // Test if the user exist in the vote array
            var vote = test_user_vote(website_id, user_id);
            console.log('The user voted before:' + vote + ', webid: ' + website_id);

            // Change vote from up to down
            if (vote == 1) Websites.update( {_id: website_id},  { $pull: { votes_up: user_id }, $inc: { count_vup: -1 } } );

            // Unvote
            if (vote == -1)  Websites.update( {_id: website_id},  { $pull: { votes_down: user_id }, $inc: { count_vdw: -1 } } );

            if (vote != -1) {   // Inser vote only if it doesn't exist
                Websites.update(
                            {_id: website_id}, 
                            { $push: { votes_down: user_id }, $inc: { count_vdw: 1 } }
                        );
            }
        } else {
            $('#must_log_warning_' + website_id).show();
        }
        return false; // prevent the button from reloading the page
    },
    
    "click .js-hide-alert": function(event) {
        $('#must_log_warning_' + this._id).hide("fast");
    },
    
    "click .js-delete-website": function(event) {
        var website_id = this._id;
    
        if (this.createdBy == Meteor.user()._id) {  // only the owner can do this
            $("#item_" + website_id).hide('slow', function() {
                Websites.remove({ "_id" : website_id });
            })  
        }
    },
    
    "click .js-show-edit-modal": function(event) {
        console.log('js-show-edit-modal');
        $("#edit_top_title").text(this.title);
        $("#edit_id").val(this._id);
        $("#edit_url").val(this.url);
        $("#edit_title").val(this.title);
        $("#edit_description").val(this.description);
        
        $("#edit_website_form").modal('show');
    }
})


Template.edit_website_form.events({
    "submit .js-edit-website": function(event){
        console.log('js-edit-website -> ' + event.target.edit_id.value);

        if (Meteor.user()) {
            var new_web = {
                url         : event.target.edit_url.value,
                title       : event.target.edit_title.value,
                description : event.target.edit_description.value,
                modifiedOn  : new Date()
            };
            console.log('new:' + new_web);
            
            // Websites posted by users should have an URL and a description.
            if (!new_web.url || !new_web.description) {
                $('#required_warning2').show();
                return false;
            } else {
                // Update the colletion
                Websites.update({ _id: event.target.edit_id.value },
                                { $set: new_web }
                                 );

                
                // Close form
                $("#edit_website_form").modal('hide');
                return false;                
            }
        }        

        return false;// stop the form submit from reloading the page

    }
});


/// Template related to the behaivor of the new website form
Template.website_add_new.events({
    "click .js-toggle-website-form":function(event){
        $("#website_add_new").toggle('slow');
    }, 
    "submit .js-save-website-form":function(event){

        if (Meteor.user()) {
            var new_web = {
                url         : event.target.url.value,
                title       : event.target.title.value,
                description : event.target.description.value,
                createdOn   : new Date(),
                createdBy   : Meteor.user()._id,
                votes_up    : [],
                votes_down  : [],
                count_vup   : 0,
                count_vdw   : 0
            };
//            console.log('url:' + new_web.url);
//            console.log('title:' + new_web.title);
//            console.log('description:' + new_web.description);
            
            // Websites posted by users should have an URL and a description.
            if (!new_web.url || !new_web.description) {
                $('#required_warning').show();
                return false;
            } else {
                // Insert to collection
                Websites.insert(new_web);
                
                // Clear form fields
                event.target.url.value = '';
                event.target.title.value = '';
                event.target.description.value = '';
                
                // Close form
                $("#website_add_new").toggle("slow", function() {
                    // Animation complete.
                });
                return false;                
            }
        }        

        return false;// stop the form submit from reloading the page

    }
});




