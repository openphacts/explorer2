App.TableHeaderView = Ember.View.extend({
    templateName: 'tableHeader',
    tagName: 'th',
    click: function() {
        console.log('clickety click');
  }
});
