App.TreesIndexController = Ember.ArrayController.extend({

  needs: ['application'],

  queryParams: ['ontology'],

  ontology: null,
  
  initialTree: null,
  defaultTree: null,
  selectedTree: null,
  treeTypes: ["enzyme", "chembl", "chebi", "go"],
  childTreeNodes: [],

  fetching: false,

  selectedTreeChanged: function() {
    if(this.get('selectedTree') !== null && this.get('selectedTree') !== this.get('initialTree')) {
        console.log('selected tree changed ' + this.get('selectedTree'));
        this.transitionToRoute('trees.index', {queryParams: {'ontology': this.get('selectedTree')}});
    }
  }.observes('selectedTree')

});
    
