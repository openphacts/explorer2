module("Ember.js Library", {
    setup: function() {
        Ember.run(App, App.advanceReadiness);
    },
    teardown: function() {
        App.reset();
    }
});

test("Check HTML is returned", function() {

    visit("/").then(function() {
        ok(exists("*"), "Found HTML!");
    });

});
