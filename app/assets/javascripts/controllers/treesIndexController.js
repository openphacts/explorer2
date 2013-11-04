App.TreesIndexController = Ember.ArrayController.extend({

  defaultTree: 'enzyme',
  selectedTree: 'enzyme',
  treeTypes: ["enzyme", "chembl"],

  selectedTreeChanged: function() {
    if(this.get('selectedTree') !== null) {
        console.log('selected tree changed ' + this.get('selectedTree'));
    }
  }.observes('selectedTree')

});
    
