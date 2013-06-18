App.TreeNodeView = Ember.View.extend({
  opened: false,
  branch: function(){
	var name, uri;
	uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
    if(uri.match(/-$/)){ return true; }
  }.property(),
  subBranch: undefined,
  fetchedData: false,
  tagName: 'li',
  // class names that determine what icons are used beside the node
  classNameBindings: ['opened: tree-branch-open', 'branch:tree-branch-icon:tree-node-icon'],
  //templateName: 'treenode',
  // Ember had some issues with finding the treenode template when the branch view is dynamically added to
  // the parent collection view in the click event. Had to compile the template here instead
  template: Ember.Handlebars.compile('{{view.content.name}} {{view.content.uri}}'),
  //classNames: ['treenode'],
  click: function(evt) {
	// the initial treebranch is loaded with data from the controller, sub branches are given data directly
	// hence the need to get the data slightly differently. Sure it's a fudge but.....
	if (this.get('opened')) {
		// user wants to close the branch
		var index = this.get('parentView').indexOf(this) + 1;
		this.get('parentView').removeAt(index);
		this.set('opened', false);
	} else if (this.get('fetchedData')){
		// user wants to open the branch and we have already created the view before
		var index = this.get('parentView').indexOf(this) + 1;
		this.get('parentView').insertAt(index, this.get('subBranch'));
		this.set('opened', true);
	} else {
		// user wants to open the branch for the first time
		var name, uri;
		var me = this;
		name = this.get('content').name ? this.get('content').name : this.get('content').get('name');
		uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
	    console.log("Clicked on " + name + " " + uri);
	    if (uri.match(/-$/)) {
		    // only fetch for uris which end with a '-' eg http://purl.uniprot.org/enzyme/5.3.-.-
		    var treeBranchView = App.TreeBranchView.create();
		    var searcher = new Openphacts.EnzymeSearch(ldaBaseUrl, appID, appKey);
	        var callback = function(success, status, response) {
		        if (success && response) {
			        var members = searcher.parseClassificationClassMembers(response);
			        var membersWithSingleName = [];
			        $.each(members, function(index, member) {
				        membersWithSingleName.push({'name' : member.names[0], 'uri': member.uri});
			        });
			        treeBranchView.set('content', membersWithSingleName);
				    var index = me.get('parentView').indexOf(me) + 1;
				    me.get('parentView').insertAt(index, treeBranchView);
				    me.set('opened', true);
				    me.set('subBranch', treeBranchView);
				    me.set('fetchedData', true);
			    }
		    }
		    searcher.getClassificationClassMembers(uri, callback);
	    }
	}
  }
});