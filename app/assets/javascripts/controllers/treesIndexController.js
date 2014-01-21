App.TreesIndexController = Ember.ArrayController.extend({

  defaultTree: 'enzyme',
  selectedTree: 'enzyme',
  treeTypes: ["enzyme", "chembl", "chebi", "go"],
  childTreeNodes: [],
  sortProperties: ['uri'],
  sortAscending: true,
  sortFunction: function(x,y) {
    console.log('sorting ' + x + ' ' + y);
    var a = x.split('/').pop();
    var b = y.split('/').pop();
    if (a === b) {
      return 0;
    }
    return a < b ? -1 : 1;
  },

  selectedTreeChanged: function() {
    if(this.get('selectedTree') !== null) {
        console.log('selected tree changed ' + this.get('selectedTree'));
        $.each(this.get('childTreeNodes'), function(index, childTreeNode) {
          console.log('inside child tree node');
        });
        this.get('model').clear();
        var me = this;
	    var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
	    var callback = function(success, status, response) {
		    if (success && response) {
			    var root = searcher.parseRootNodes(response);
			    $.each(root, function(index,enzymeResult) {
				    var enzyme = me.store.createRecord('tree', enzymeResult);
                    enzyme.set('id', enzymeResult.uri.split('/').pop());
                    enzyme.set('level', 1);
				    me.addObject(enzyme);
                    enzyme.set('hasChildren', false);
                    enzyme.set('opened', false);
		            var innerCallback = function(success, status, response) {
			          if (success && response) {
			              var members = searcher.parseChildNodes(response);
                          //does the node have children
                          enzyme.set('hasChildren', members.children.length > 0 ? true : false);
				      }
			        }
                    searcher.getChildNodes(enzymeResult.uri, innerCallback);		    
			    });
			}
		}
	    searcher.getRootNodes(this.get('selectedTree'), callback);
    }
  }.observes('selectedTree')

});
    
