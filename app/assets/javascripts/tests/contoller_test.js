emq.globalize();
App.setupForTesting();
App.injectTestHelpers();
setResolver(Ember.DefaultResolver.create({
    namespace: App
}));

moduleFor('controller:compoundsIndex', 'Compounds Index Controller', {
    needs: ['controller:application']
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
test('provenance can be enabled and disabled via the actions', function() {
    expect(3);
    var ctrl = this.subject();
    // check the properties before the action is triggered
    equal(ctrl.get('showProvenance'), false);
    ctrl.send('enableProvenance');
    equal(ctrl.get('showProvenance'), true);
    ctrl.send('disableProvenance');
    equal(ctrl.get('showProvenance'), false);
});
