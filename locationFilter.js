__extends(LocationFilter, FacetBase);
function LocationFilter(element, options, bindings){
    FacetBase.call(this, element, options, bindings, LocationFilter.ID);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, RadioButtonFacet, options);
    this.wrapperClass = 'location-filter-wrapper';
    this.$element = Coveo.$(element);

    this.suggestedLocations = [];
};

LocationFilter.ID = 'LocationFilter';
LocationFilter.options = {
    title: Coveo.ComponentOptions.buildStringOption()
}

LocationFilter.prototype.buildComponent = function(groupByResults){
    this.$element.find(this.wrapperClass).unbind().remove();

    var wrapper = Coveo.$('<div />', {"class" : this.wrapperClass,
                                      "css" : {"width" : "200px"}});
    var inputBox = Coveo.$('<input />', {"class" : "location-filter-input", 
                          "type" : "text",
                          "placeholder" : this.options.title});

    inputBox.keyup(this.getSuggestedLocations.bind(this));
    inputBox.appendTo(wrapper);

    this.buildSuggestedList(wrapper);

    wrapper.appendTo(this.$element);
};

LocationFilter.prototype.buildSuggestedList = function(wrapper){
    this.suggestedLocations.forEach(function(location){
        var locationWrapper = Coveo.$('<div />', {"class" : "location-wrapper"});
        // TODO - sniff these objects for the field name
        Coveo.$('<p />', {"text" : "location name"}).appendTo(locationWrapper);
        locationWrapper.appendTo(wrapper);
    })
};

LocationFilter.prototype.getSuggestedLocations = function(e){
    this.suggestedLocations = [];

    var searchTerms = e.target.value;

    // Go out and get the suggested list, given these search terms
};

Coveo.CoveoJQuery.registerAutoCreateComponent(LocationFilter);