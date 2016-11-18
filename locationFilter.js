__extends(LocationFilter, FacetBase);
function LocationFilter(element, options, bindings){
    FacetBase.call(this, element, options, bindings, LocationFilter.ID);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, RadioButtonFacet, options);
    this.wrapperClass = 'location-filter-wrapper';
    this.$element = Coveo.$(element);

    this.suggestedLocations = [];


    var wrapper = Coveo.$('<div />', {"id" : LocationFilter.ID,
                                      "class" : this.wrapperClass,
                                      "css" : {"width" : "200px"}});

    var inputBox = Coveo.$('<input />', {"id" : "location-filter-input", 
                          "type" : "text",
                          "placeholder" : this.options.title});

    //inputBox.keyup(this.getSuggestedLocations.bind(this));
    inputBox.appendTo(wrapper);
    this.buildSuggestedList(wrapper);
    wrapper.appendTo(this.$element);

    this.autocomplete = new google.maps.places.Autocomplete((this.$element.find("#location-filter-input").get(0)),
                                                            {types: ['geocode']});          
    this.autocomplete.addListener('place_changed', this.sortByLocation.bind(this));                                                  
};

LocationFilter.ID = 'LocationFilter';
LocationFilter.options = {
    title: Coveo.ComponentOptions.buildStringOption()
}

LocationFilter.prototype.sortByLocation = function(){
    var place = this.autocomplete.getPlace();

    var latitude = place.geometry.location.lat();
    var longitude = place.geometry.location.lng();
};

LocationFilter.prototype.buildComponent = function(groupByResults){
    //this.$element.find(this.wrapperClass).unbind().remove();

    
    
    
    
};

LocationFilter.prototype.buildSuggestedList = function(wrapper){
    this.$element.find("." + "location-wrapper").unbind().remove();

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
    var places = this.autocomplete.getPlace();

    var x = 1;
};

Coveo.CoveoJQuery.registerAutoCreateComponent(LocationFilter);