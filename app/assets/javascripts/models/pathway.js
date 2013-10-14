App.Pathway = DS.Model.extend({
  compound: DS.belongsTo('App.SearchResult'),
  title: DS.attr('string'),
  identifier: DS.attr('string'),
  description: DS.attr('string'),
  pathwayOntologies: DS.attr('array'),
  organism: DS.attr('string'),
  organismLabel: DS.attr('string'),
  geneProductLabel: DS.attr('string'),
  geneProductURI: DS.attr('string'),
  geneProductCWURI: DS.attr('string'),
  about: DS.attr('string'),
  parts: DS.attr('array')
});
App.Pathway.reopenClass({
    find: function(id) {
      var pathway = App.Pathway.createRecord();
      var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      var pathwayInfoCallback=function(success, status, response){
        if (success && response) {
          var pathwayResult = searcher.parseInformationResponse(response);
          pathway.setProperties(pathwayResult);
	      pathway.trigger('didLoad');        
        }
    };
    searcher.information('http://identifiers.org/wikipathways/' + id, null, pathwayInfoCallback);
    return pathway;
    }
});
