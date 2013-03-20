App.SearchResult = Ember.View.extend({
  templateName: 'searchresult',
  contract: function() {
    console.log('contract');
    var compound = this.get('compound');
    compound.set('isExpanded', false);
  },
  expand: function() {
    console.log('contract');
    var compound = this.get('compound');
    compound.set('isExpanded', true);
  }
//  click: function() {
//        $('#infobox').html('<b>Not exact match</b>');
//        $('#info_popup').show();
//  }
});
