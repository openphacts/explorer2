emq.globalize();
App.setupForTesting();
App.injectTestHelpers();
setResolver(Ember.DefaultResolver.create({
    namespace: App
}));

moduleFor('controller:search', 'Search Controller', {
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
test('check and uncheck compounds and targets via the actions', function() {
    expect(6);
    var ctrl = this.subject();
    // check the properties before the action is triggered
    equal(ctrl.get('compoundsChecked'), true);
    ctrl.send('setCompoundsChecked');
    equal(ctrl.get('compoundsChecked'), false);
    ctrl.send('setCompoundsChecked');
    equal(ctrl.get('compoundsChecked'), true);
    equal(ctrl.get('targetsChecked'), true);
    ctrl.send('setTargetsChecked');
    equal(ctrl.get('targetsChecked'), false);
    ctrl.send('setTargetsChecked');
    equal(ctrl.get('targetsChecked'), true);
});
test('switch to list view and objecct view via the actions', function() {
    expect(8);
    var ctrl = this.subject();
    // check the properties before the action is triggered
    equal(ctrl.get('listView'), true);
    equal(ctrl.get('objectView'), false);
    ctrl.send('switchToObject');
    equal(ctrl.get('listView'), false);
    equal(ctrl.get('objectView'), true);
    ctrl.send('switchToList');
    equal(ctrl.get('listView'), true);
    equal(ctrl.get('objectView'), false);
    ctrl.send('switchToObject');
    equal(ctrl.get('listView'), false);
    equal(ctrl.get('objectView'), true);
});
