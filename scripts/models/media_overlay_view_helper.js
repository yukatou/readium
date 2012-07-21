// Description: This model provides helper methods related to Media Overlay functionality required by the fixed and reflowable views.
// Rationale: While these helpers could be included on the view objects themselves, this model was created to encapsulate view functionality
//   related to the display of media overlays for three reasons: First, the requirements for media overlays are expected to grow, which
//   would have produced larger and larger view models (by code size). Second, the primary responsibility of the pagination views is to paginate epub content
//   and provide an interface for accessing rendered content; adding MO methods to those objects would have clouded the abstraction. Third, MO
//   is the primary responsiblity of one contributor. Encapsulating MO view functionality in this model makes it easier for contributors to 
//   focus on their areas of responsibility. 

// REFACTORING CANDIDATE: The interfaces for the methods here are not particularly tight. In some cases, entire views are being 
//   passed to the methods. It would be better if the interfaces were built around something consistent; the page body being passed, 
//   etc. 
//   Interaction with the "pagination" could be improved too. It would be ideal to encorporate the concept of the "currently rendered
//   pages" into the methods here; this would use the ReadiumPagination model, which abstracts this concept. Currently, these methods
//   are working through the backbone views, but essentially using the DOM.

Readium.Models.MediaOverlayViewHelper = Backbone.Model.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function () {

		this.epubController = this.get("epubController");
	},

    // active class comes from the package document metadata
    // authors can specify the class name they want to have applied to 
    // active MO text fragments
    addActiveClass: function(fragElm) {
        var activeClass = this.getActiveClass();
        fragElm.toggleClass(activeClass, true);
    },

    removeActiveClass: function(body) {
        if (body != null && body != undefined) {   
            var activeClass = this.getActiveClass();
            var lastFrag = $(body).find("." + activeClass);
            lastFrag.toggleClass(activeClass, false);
            return lastFrag;
        }
        return null;
    },

	// we're not using themes for fixed layout, so just apply the active class name to the
    // current MO fragment, so that any authored styles will be applied.
    renderFixedLayoutMoFragHighlight: function(currentPages, currentMOFrag, fixedLayoutView) {
        var that = this;

        // REFACTORING CANDIDATE: Not sure what the this.toString() is doing? Is it intended that that is an index. 
        //  unsure why the toString() is required. 
		// get rid of the last highlight
		$.each(currentPages, function(idx) {
           var body = fixedLayoutView.getPageBody(this.toString());
           that.removeActiveClass(body);
        }); 
        
		if(currentMOFrag) {
    		$.each(currentPages, function(idx) {
                var body = fixedLayoutView.getPageBody(this.toString());
                var newFrag = $(body).find("#" + currentMOFrag);
                if (newFrag) {

                	that.addActiveClass(newFrag);	
                } 
           });
		}
	},

    // apply the active class to the current MO fragment and also
    // apply the default theme colors to it
	renderReflowableMoFragHighlight: function(currentTheme, reflowableView, currentMOFrag) {

		if (currentTheme === "default") {

			currentTheme = "default-theme";
		}

		// get rid of the last highlight
		var body = reflowableView.getBody();
        var lastFrag = this.removeActiveClass(body);
        if (lastFrag) {
            $(lastFrag).css("color", "");
        }
        
		if (currentMOFrag) {
            // add active class to the new MO fragment
            var newFrag = $(body).find("#" + currentMOFrag);
            if (newFrag) {
                this.addActiveClass(newFrag);
                $(newFrag).css("color", reflowableView.themes[currentTheme]["color"]);   
            }
		}
	},	

	// reflowable pagination uses default readium themes, which include a 'fade' effect on the inactive MO text
	renderReflowableMoPlaying: function(currentTheme, MOIsPlaying, reflowableView) {
		
		if (currentTheme === "default") { 
			currentTheme = "default-theme";
		}

		var body = reflowableView.getBody();
        if (MOIsPlaying) {
            // change the color of the body text so it looks inactive compared to the MO fragment that is playing
			$(body).css("color", reflowableView.themes[currentTheme]["mo-color"]);
		}
		else {
            // reset the color of the text to the theme default
			$(body).css("color", reflowableView.themes[currentTheme]["color"]);	

            // remove style info from the last MO fragment
            var lastFrag = this.removeActiveClass(this.getBody());
            if (lastFrag) {
                $(lastFrag).css("color", "");
            }
		}
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

    getActiveClass: function() {

    	return this.epubController.packageDocument.get("metadata").active_class;
    }
});