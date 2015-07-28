App.CompoundsPathwaysController = Ember.Controller.extend({

    needs: ['application', 'flash'],

    queryParams: ['uri'],

    uri: '',
    
    infoHide: false,    

    page: null,

    showProvenance: false,

    currentCount: function() {
        return this.get('model.pathways.length');
    }.property('model.pathways.length'),

    totalCount: null,

    notEmpty: function() {
        return this.get('totalCount') > 0;
    }.property('totalCount'),

    fetching: false,

    actions: {
        fetchMore: function() {
            if (this.get('model.pathways.length') < this.totalCount && this.totalCount > 0 && this.get('controllers.application').get('fetching') === false) {
                var me = this;
                me.get('controllers.application').set('fetching', true);
		var thisCompound = this.get('content');
                var searcher = new PathwaySearch(ldaBaseUrl, appID, appKey);
                var pathwaysByCompoundCallback = function(success, status, response) {
                    if (success && response) {
                        me.page++;
                        var pathwayResults = searcher.parseByCompoundResponse(response);
                        $.each(pathwayResults, function(index, pathway) {
                            pathwayID = pathway.identifier;
                            //have to find the pathway record and add it, just adding the ID does not work
                            me.get('store').find('pathway', pathwayID).then(function(pathway) {
                                thisCompound.get('pathways').pushObject(pathway);
                            });
                        });
                        me.get('controllers.application').set('fetching', false);
                        enable_scroll();
                    } else {
                        //failed response so scrolling is now allowed
                        me.get('controllers.application').set('fetching', false);
                        enable_scroll();
                    }
                };
                searcher.byCompound(thisCompound.get('URI'), null, null, me.page + 1, 50, null, pathwaysByCompoundCallback);
            } else {
                enable_scroll();
            }
        },

        enableProvenance: function() {
            this.get('showProvenance') === false ? this.set('showProvenance', true) : '';
        },

        disableProvenance: function() {
            this.get('showProvenance') === true ? this.set('showProvenance', false) : '';
        },

        goToTop: function() {
            window.scrollTo(0, 0);
        }
    }

});
