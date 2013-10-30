App.TreeNodeView = Ember.View.extend({
  opened: false,
  highlighted: false,
  branch: function(){
	var name, uri;
	uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
	    if(uri.match(/-$/)){ return true; }
	  }.property(),
  subBranch: undefined,
  fetchedData: false,
  indentLevel: function(){
	uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
	var enzyme = uri.split('/')[uri.split('/').length -1];
	var levels = enzyme.split('.');
	var totalLevels = 0;
	$.each(levels, function(index, level) {
		if (level !== '-') {
			totalLevels += 1;
		}
	});
	return 'indentLevel' + totalLevels;
  }.property(),
  tagName: 'div',
  // class names that determine what icons are used beside the node
  classNameBindings: ['opened: tree-branch-open:tree-branch-closed', 'branch:tree-branch-icon:tree-node-icon', 'indentLevel', 'highlighted: highlight-on'],
  classNames: ['treerow'],
  templateName: 'treenode',
  // Ember had some issues with finding the treenode template when the branch view is dynamically added to
  // the parent collection view in the click event. Had to compile the template here instead
  //template: Ember.Handlebars.compile('<img src="/assets/table.png" class="single-enzyme-icon"><img src="/assets/folder_go.png" class="folder-open" {{action expand target="view"}}></img><img src="/assets/folder.png" class="folder-closed" {{action expand target="view"}}></img><div class="enzymeURI">{{enzymeECNumber view.content.uri}}</div>{{enzymePharmaLink view.content.uri view.content.name}}'),

  mouseEnter: function(evt) {
		var name, uri;
		var me = this;
		name = this.get('content').name ? this.get('content').name : this.get('content').get('name');
		uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
	    console.log("Mouse Enter " + name + " " + uri);
	    this.set('highlighted', true);
  },
  mouseLeave: function(evt) {
		var name, uri;
		var me = this;
		name = this.get('content').name ? this.get('content').name : this.get('content').get('name');
		uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
	    console.log("Mouse leave " + name + " " + uri);
	    this.set('highlighted', false);
  },
  expand: function() {
        console.log('expand');
        var me = this;
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
			    treeBranchView.set('content', []);
			    var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
		        var callback = function(success, status, response) {
			        if (success && response) {
				        var members = searcher.parseChildNodes(response);
				        var membersWithSingleName = [];
				        $.each(members, function(index, member) {
							var enzyme = me.get('controller').store.createRecord('enzyme');
						    enzyme.set('uri', member.uri);
							enzyme.set('name', member.names[0]);
							enzyme.set('id', member.uri.split('/').pop());
		                    treeBranchView.get('content').pushObject(enzyme);
					        //membersWithSingleName.push({'name' : member.names[0], 'uri': member.uri});
				        });
				        //treeBranchView.set('content', membersWithSingleName);
					    var index = me.get('parentView').indexOf(me) + 1;
					    me.get('parentView').insertAt(index, treeBranchView);
					    me.set('opened', true);
					    me.set('subBranch', treeBranchView);
					    me.set('fetchedData', true);
				    }
			    }
			    searcher.getChildNodes(uri, callback);
		    }
		}
  }
});
