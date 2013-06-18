App.TreeBranchView = Ember.CollectionView.extend({
  tagName: 'ul',
  //templateName: 'treebranch',
  classNames: ['treebranch'],
  itemViewClass: 'App.TreeNodeView'
});