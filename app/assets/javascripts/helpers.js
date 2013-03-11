Handlebars.registerHelper('cs_image_src', function(compound) {
  //TODO I'm sure the context can be changed to the actual compound somehow in the view, I'm just not sure how at the moment
  return "http://www.chemspider.com/ImagesHandler.ashx?id=" + compound.contexts[0].csid + "&amp;w=128&amp;h=128";
});
$(window).scroll(function() {
    var s = $(window).scrollTop(),
        d = $(document).height(),
        c = $(window).height();
        scrollPercent = (s / (d-c)) * 100;
    if (scrollPercent >= 97 && !App.searchResultsController.isSearching) {
        console.log("Fetching results for scroll");
        App.searchResultsController.search(App.searchResultsController.getCurrentQuery());
    }
});
