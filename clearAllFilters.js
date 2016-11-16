__extends(ClearAllFilters, _super);
function ClearAllFilters(element, options, bindings){
    _super.call(this, element, ClearAllFilters.ID, bindings);

    this.options = Coveo.ComponentOptions.initComponentOptions(element, ClearAllFilters, options);
    this.$element = Coveo.$(element);
    this.wrapperClass = 'clear-all-filters';

    this.bind.onRoot(Coveo.QueryEvents.deferredQuerySuccess, this.handleQuerySuccess);
};

ClearAllFilters.ID = "ClearAllFilters";
ClearAllFilters.options = {
    title: Coveo.ComponentOptions.buildStringOption()
}

ClearAllFilters.prototype.handleQuerySuccess = function(e, data){
    this.$element.find("." + this.wrapperClass).unbind().remove();

    var wrapper = Coveo.$('<div />', {"class" : this.wrapperClass, "css" : {"width" : "150px"}})
    Coveo.$('<p />', {"class" : "clear-filters-label", "text" : "Clear All Filters!", "css" : {"background-color" : "red"}}).appendTo(wrapper);

    wrapper.click(this.handleClearFiltersClick.bind(this));

    wrapper.appendTo(this.$element);
};

ClearAllFilters.prototype.handleClearFiltersClick = function(){

    // clear dem filters
    this.queryStateModel.reset();
    this.queryController.deferExecuteQuery();
};

Coveo.CoveoJQuery.registerAutoCreateComponent(ClearAllFilters);