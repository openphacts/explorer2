App.FlashMessage = DS.Model.extend({
    type: DS.attr('string'),
    message: DS.attr('string'),
    isNotice: function() {
        return this.get("type") === "notice";
    }.property("type"),
    isSuccess: function() {
        return this.get("type") === "success";
    }.property("type"),
    isError: function() {
        return this.get("type") === "error";
    }.property("type")
});
