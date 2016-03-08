
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
        if (Meteor.user())  return (test_user_vote(this._id, Meteor.user()._id) == 1);
        else                return false;
    },    
    votedDown: function() {
        if (Meteor.user())  return (test_user_vote(this._id, Meteor.user()._id) == -1);
        else                return false;
    },
    isOwner: function(ownerId) {
        if (Meteor.user())  return (Meteor.user()._id == ownerId);
        else                return false;
    }
});



// helper functions for detail screen
Template.detail_screen.helpers({
    prettifyDate: format_date,
    getUser: user_name,
    userVote: function() {
        if (Meteor.user()) {
            var vote = test_user_vote(this._id, Meteor.user()._id);
            if (vote == 1)  return '<span class="label label-success">Up</span>';
            if (vote == -1) return '<span class="label label-danger">Down</span>';
        }
        return '<span class="label label-default">No vote</span>';
    }
});


// helper functions for recommendations box
Template.website_recomendations.helpers({
    recom: function() {
        if (Meteor.user()) {
            return Recommendations.find(
                    { user_id: Meteor.user()._id },
                    { limit : 4}
                );
        } 
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


// This function launch an http request (in the server), and inspect the response
// in order to find metadata about this url (title and description)
function get_web_info(website_url) {
    console.log('get_web_info');
//    var website_url = 'https://blogdelbarba.wordpress.com';
//    var website_url = 'http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route';
    
    if (website_url == "") return false; // it cannot be empty
    
    // To avoid look for the same url again
    if (Session.get("url_suggestion") == website_url) return false;
    Session.set("url_suggestion", website_url);
    $('#waiting_url_info_indicator').show();
    
    try {
        Meteor.call('get_website_info_by_http', website_url, function(err, response) {

            if (err) {
                $('#waiting_url_info_indicator').hide();
                return false;
            }

            console.log('Inspect the html response');

            if (response.statusCode == 200) {

                // Look for the <title> tag, and the <meta name="description" />
                var cont = response.content;

                var pos1 = cont.indexOf('>', cont.indexOf('<title') + 1) + 1;
                var pos2 = cont.indexOf('</title', pos1);
                var html_title = cont.substring(pos1, pos2);
                console.log('title = ' + html_title);

                var html_description = "";
                var pos1 = cont.indexOf('<meta');
                var count = 0;
                while (pos1 != -1) {

                    pos2 = cont.indexOf('>', pos1);
                    var all_meta = cont.substring(pos1, pos2);
//                    console.log('meta = ' + all_meta);

                    var name_cont = parser_html_tag(all_meta, 'name');
                    if (name_cont != "") {
                        if (name_cont.indexOf('description') > -1) {
                            html_description = parser_html_tag(all_meta, 'content');
                            console.log ('html_description = ' + html_description);
                            pos1 = -1;
                        }
                    }
                    if (html_description == '') pos1 = cont.indexOf('<meta', pos2 + 1);
                    count++; if (count > 100) pos1 = -1; /// To avoid looping
                }

                if (html_title != '' || html_description != '') {
                    $('#url_html_suggested_info #sug_url').html('<a href="' + website_url + '" target="_blank"><strong>' + website_url + '</strong></a>');
                    $('#url_html_suggested_info #sug_title').text(html_title);
                    $('#url_html_suggested_info #sug_description').text(html_description);

                    $("#url_html_suggested_info").modal('show');
                }
            }
            $('#waiting_url_info_indicator').hide();
        });
        
    } catch(err) { 
        console.log('Error: ' + err);
        $('#waiting_url_info_indicator').hide(); 
    }
}


function parser_html_tag(str, tag_name) {
    
    var tag_name_ini = str.indexOf(tag_name);
    if (tag_name_ini == -1) return "";
    
    var eq_ini = str.indexOf('=', tag_name_ini);
    var quote_type = '"';
    var quote_ini = str.indexOf(quote_type, eq_ini);
    var quote_ini2 = str.indexOf('"', eq_ini);
    if (quote_ini2 > -1 && quote_ini2 < quote_ini) {
        quote_type = "'";
        quote_ini = quote_ini2;
    }
    var quote_fi = str.indexOf(quote_type, quote_ini + 1);
    if (quote_ini == -1 || quote_fi == -1) return "";
    
    return str.substring(quote_ini + 1, quote_fi);
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
    "click .js-get-web-info": function(event) { generate_webrefs(); },
    "focusout .js-new-web-url": function(event) { 
        console.log('inspect -> ' + $('.js-save-website-form #url').val());
        get_web_info($('.js-save-website-form #url').val());
    }
});
// Hide the waiting indicator just after the template is loaded
Template.website_add_new.rendered = function() {
    $('#waiting_url_info_indicator').hide();
};

Template.url_html_suggested_info.events({
    "click .js-set-suggestions": function(event) {
        $('#website_add_new #title').val( $('#url_html_suggested_info #sug_title').text() );
        $('#website_add_new #description').val( $('#url_html_suggested_info #sug_description').text() );
        $("#url_html_suggested_info").modal('hide');
    }
});



Template.website_recomendations.events({
    "click .js-del-recommendation": function(event) { 
        var that = this;
        $(event.target).parent().hide('slow', function() {
            console.log('delete recommendation ' + that._id);
            Recommendations.remove({ _id: that._id});
        });
    }
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
//                recEngine.link(user_id, website_id);    // Recommendation input
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
                count_vdw   : 0,
                refs        : [],
                count_refs  : 0
            };
//            console.log('url:' + new_web);
            
            // Websites posted by users should have an URL and a description.
            if (!new_web.url || !new_web.description) {
                $('#required_warning').show();
                return false;
            } else {
                // Insert to collection
                var website_id = Websites.insert(new_web);
                
                // Generate references (WebRefs) immediately
                new_web._id = website_id;
                generate_webrefs(new_web);
                var count_refs = Recommendations.find({user_id: Meteor.user()._id}).count();
                set_references_web_user(Meteor.user(), new_web, count_refs);
                
                // Clear form fields
                event.target.url.value = '';
                event.target.title.value = '';
                event.target.description.value = '';
                
                // Close form
                $("#website_add_new").toggle("slow");
                return false;                
            }
        }        

        return false;// stop the form submit from reloading the page

    }
});




// joel-barba-website-aggregator.meteor.com

