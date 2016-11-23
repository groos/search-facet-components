__extends(LocationFilter, _super);
function LocationFilter(element, options, bindings){
    _super.call(this, element, LocationFilter.ID, bindings);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, LocationFilter, options);

    this.sortField = "@" + this.options.field;
    this.sortDirection = this.options.sortDirection ? this.options.sortDirection : "ascending";

    this.wrapperClass = 'location-filter-wrapper';
    this.$element = Coveo.$(element);

    this.bind.onRoot(Coveo.QueryEvents.buildingQuery, this.handleBuildingQuery);

    this.buildComponent();                                                 
};


/*

    To Add:
        - Add breadcrumb support?

*/

LocationFilter.ID = 'LocationFilter';
LocationFilter.options = {
    field: Coveo.ComponentOptions.buildStringOption(),
    latitude: Coveo.ComponentOptions.buildStringOption(),
    longitude: Coveo.ComponentOptions.buildStringOption(),
    title: Coveo.ComponentOptions.buildStringOption()
}

LocationFilter.prototype.buildComponent = function() {
    var wrapper = Coveo.$('<div />', {"id" : LocationFilter.ID,
                                      "class" : this.wrapperClass,
                                      "css" : {"width" : "200px", "display" : "inline"}});

    var inputBox = Coveo.$('<input />', {"id" : "location-filter-input", 
                          "type" : "text",
                          "placeholder" : this.options.title});

    inputBox.appendTo(wrapper);

    var clearLocationWrapper = Coveo.$('<div />', {"class" : "clear-location-wrapper",
                                "css" : {"background-color" : "red", 
                               "display" : "inline-block",
                               "text-align" : "center",
                               "margin-left" : "10px",
                               "width" : "50px"}});

    Coveo.$('<p />', {"id" : "clear-location-button", 
                      "text" : "X"
                      })
                      .appendTo(clearLocationWrapper);

    clearLocationWrapper.click(this.clearLocationFilter.bind(this));

    clearLocationWrapper.appendTo(wrapper);
    wrapper.appendTo(this.$element);

    // Google Autocomplete bindings
    this.autocomplete = new google.maps.places.Autocomplete((this.$element.find("#location-filter-input").get(0)),
                                                            {types: ['geocode']});          
    this.autocomplete.addListener('place_changed', this.locationPicked.bind(this)); 
};

LocationFilter.prototype.clearLocationFilter = function(){
    this.$element.find('.' + this.wrapperClass).unbind().remove();
    this.buildComponent();
    this.locationPicked();
};

LocationFilter.prototype.buildQueryFunction = function(){
    if (this.latitude && this.longitude){
        return {"function":"dist(" + this.options.latitude + ", " + this.options.longitude + ", " + this.latitude + ", " + this.longitude + ")", "fieldName": this.sortField};
    }
};

LocationFilter.prototype.handleBuildingQuery = function(e, data) {
    var queryFunction = this.buildQueryFunction();
    if (queryFunction){
        data.queryBuilder.queryFunctions.push(queryFunction);
        data.queryBuilder.sortCriteria = this.sortField + " " + this.sortDirection;
    }
};

LocationFilter.prototype.locationPicked = function(){
    var place = this.autocomplete.getPlace();

    if (place){
        this.latitude = place.geometry.location.lat();
        this.longitude = place.geometry.location.lng();
    } else {
        this.latitude = null;
        this.longitude = null;
    }

    this.queryController.deferExecuteQuery();
};

Coveo.CoveoJQuery.registerAutoCreateComponent(LocationFilter);