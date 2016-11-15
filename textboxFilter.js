__extends(TextboxFilter, _super);
function TextboxFilter(element, options, bindings){
    _super.call(this, element, TextboxFilter.ID, bindings);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, TextboxFilter, options);

    this.$element = Coveo.$(element);
    this.stateName = Coveo.QueryStateModel.getFacetId(this.options.field);

    this.queryStateModel.registerNewAttribute(this.stateName, '');
}