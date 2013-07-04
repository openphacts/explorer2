App.TreeBranchView = Ember.CollectionView.extend({
  tagName: 'div',
  //templateName: 'treebranch',
  classNames: ['treebranch'],
  itemViewClass: 'App.TreeNodeView'
});