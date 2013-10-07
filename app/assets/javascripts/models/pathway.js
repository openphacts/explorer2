App.Pathway = DS.Model.extend({
  compound: DS.belongsTo('App.SearchResult'),
  title: DS.attr('string'),
  identifier: DS.attr('string'),
  description: DS.attr('string'),
  pathwayOntology: DS.attr('array'),
  organism: DS.attr('string'),
  organismLabel: DS.attr('string'),
  geneProduct: DS.attr('string'),
  about: DS.attr('string')
});
