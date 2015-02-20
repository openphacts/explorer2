emq.globalize();
App.setupForTesting();
App.injectTestHelpers();
setResolver(Ember.DefaultResolver.create({
    namespace: App
}));

moduleFor('controller:treesIndex', 'Trees Index Controller', {
	needs: ['controller:application', 'controller:flash']
});
test('can see the application controller', function() {
    expect(2);
    // get the controller instance
    var ctrl = this.subject();
    // check that the compounds index controller can see the application controller
    appCtrl = ctrl.get('controllers.application');
    equal(appCtrl.get('alertsAvailable'), false);
    appCtrl.set('alertsAvailable', true);
    equal(appCtrl.get('alertsAvailable'), true);
});
