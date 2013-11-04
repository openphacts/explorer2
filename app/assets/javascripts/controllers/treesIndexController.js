App.TreesIndexController = Ember.ArrayController.extend({

  defaultTree: 'enzyme',
  selectedTree: 'enzyme',
  treeTypes: ["enzyme", "chembl", "chebi", "go"],

  selectedTreeChanged: function() {
    if(this.get('selectedTree') !== null) {
        console.log('selected tree changed ' + this.get('selectedTree'));
        this.clear();
        var me = this;
	    var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
	    var callback = function(success, status, response) {
		    if (success && response) {
			    var root = searcher.parseRootNodes(response);
			    $.each(root, function(index,enzymeResult) {
				    var enzyme = me.store.createRecord('tree', enzymeResult);
                    enzyme.set('id', enzymeResult.uri.split('/').pop());
				    me.addObject(enzyme);				    
			    });
			}
		}
	    searcher.getRootNodes(this.get('selectedTree'), callback);
    }
  }.observes('selectedTree')

});
    
