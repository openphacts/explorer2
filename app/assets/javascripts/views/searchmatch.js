App.SearchMatch = Ember.View.extend({
  templateName: 'searchmatch',
  click: function() {
        $('#infobox').html('<b>Exact match</b>');
        $('#info_popup').show();
  }
});
