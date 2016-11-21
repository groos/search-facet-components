__extends(LocationFilter, _super);
function LocationFilter(element, options, bindings){
    _super.call(this, element, LocationFilter.ID, bindings);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, LocationFilter, options);

    this.stateName = Coveo.QueryStateModel.getFacetId(this.options.field);

    this.queryStateModel.registerNewAttribute(this.stateName, []);

    this.wrapperClass = 'location-filter-wrapper';
    this.$element = Coveo.$(element);

    this.bind.onRoot(Coveo.QueryEvents.buildingQuery, this.handleBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.doneBuildingQuery, this.handleDoneBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.deferredQuerySuccess, this.handleQuerySuccess);

    var wrapper = Coveo.$('<div />', {"id" : LocationFilter.ID,
                                      "class" : this.wrapperClass,
                                      "css" : {"width" : "200px"}});

    var inputBox = Coveo.$('<input />', {"id" : "location-filter-input", 
                          "type" : "text",
                          "placeholder" : this.options.title});

    inputBox.appendTo(wrapper);
    wrapper.appendTo(this.$element);

    this.autocomplete = new google.maps.places.Autocomplete((this.$element.find("#location-filter-input").get(0)),
                                                            {types: ['geocode']});          
    this.autocomplete.addListener('place_changed', this.locationPicked.bind(this));                                                  
};

LocationFilter.ID = 'LocationFilter';
LocationFilter.options = {
    field: Coveo.ComponentOptions.buildStringOption(),
    title: Coveo.ComponentOptions.buildStringOption()
}

LocationFilter.prototype.buildQueryFunction = function(){
    if (this.latitude && this.longitude){
        // return {"function":"dist(@latitude, @longitude, " + this.latitude + ", " + this.longitude + ")", "fieldName":"distance"};
        return {"function":"dist(@flatitude22573, @flongitude22573, " + this.latitude + ", " + this.longitude + ")", "fieldName":"distance"};
    }
};

LocationFilter.prototype.handleBuildingQuery = function(e, data) {
    var queryFunction = this.buildQueryFunction();
    if (queryFunction){
        data.queryBuilder.queryFunctions.push(queryFunction);
        data.queryBuilder.sortCriteria = "@distance ascending";
    }
};

LocationFilter.prototype.handleDoneBuildingQuery = function(e, args) {
    // now that the query is built, add the group-by request

};

LocationFilter.prototype.handleQuerySuccess = function(e, data) {
    var x = 1;
};

LocationFilter.prototype.locationPicked = function(){
    var place = this.autocomplete.getPlace();
    this.latitude = place.geometry.location.lat();
    this.longitude = place.geometry.location.lng();

    this.queryStateModel.set(this.stateName, [true]);
};

Coveo.CoveoJQuery.registerAutoCreateComponent(LocationFilter);