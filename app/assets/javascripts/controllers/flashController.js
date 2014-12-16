// Credit to Eric Berry http://coderberry.me/blog/2013/06/20/using-flash-messages-with-emberjs/
App.FlashController = Ember.ArrayController.extend({
  model: [],
  clearContent: function(content, view) {
    return view.hide(function() {
      return App.FlashQueue.removeObject(content);
    });
  }
});

//App.FlashController.addObserver('content', function() {
//  if (this.get("content")) {
//    if (this.get("view")) {
//      this.get("view").show();
//      return setTimeout(this.clearContent, 4000, this.get("content"), this.get("view"));
//    }
//  } else {
//    return App.FlashQueue.contentChanged();
//  }
//});

//App.FlashQueue = Ember.ArrayProxy.create({
//  content: [],
//  contentChanged: function() {
//    var current;
//    current = App.FlashController.get("content");
//    if (current !== this.objectAt(0)) {
//      return App.FlashController.set("content", this.objectAt(0));
//    }
//  },
//  pushFlash: function(type, message) {
//    return this.pushObject(App.FlashMessage.create({
//      message: message,
//      type: type
//    }));
//  }
//});

//App.FlashQueue.addObserver('length', function() {
//  return this.contentChanged();
//});
