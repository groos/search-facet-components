__extends(ClearAllFilters, _super);
function ClearAllFilters(element, options, bindings){
    _super.call(this, element, ClearAllFilters.ID, bindings);

    this.options = Coveo.ComponentOptions.initComponentOptions(element, ClearAllFilters, options);
    this.$element = Coveo.$(element);
    this.wrapperClass = 'clear-all-filters';

    // build the clear button one time in the constructor
    var wrapper = Coveo.$('<div />', {"class" : this.wrapperClass, "css" : {"width" : "150px", "text-align" : "center", "cursor" : "pointer"}})
    Coveo.$('<p />', {"class" : "clear-filters-label", "text" : "Clear All Filters!", "css" : {"background-color" : "red"}}).appendTo(wrapper);
    wrapper.appendTo(this.$element);

    wrapper.click(this.handleClearFiltersClick.bind(this));
};

ClearAllFilters.ID = "ClearAllFilters";
ClearAllFilters.options = {
    title: Coveo.ComponentOptions.buildStringOption()
}

ClearAllFilters.prototype.handleClearFiltersClick = function(){
    var state = this.queryStateModel.getAttributes();
    for (var key in state){
        if (state.hasOwnProperty(key) && key.indexOf('f:') == 0){
            this.queryStateModel.set(key, []);
        }
    }

    this.queryController.deferExecuteQuery();
};

Coveo.CoveoJQuery.registerAutoCreateComponent(ClearAllFilters);