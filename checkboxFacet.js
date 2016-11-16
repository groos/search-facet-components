__extends(CheckboxFacet, FacetBase);
function CheckboxFacet(element, options, bindings){
    FacetBase.call(this, element, options, bindings, CheckboxFacet.ID);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, CheckboxFacet, options);
    this.$element = Coveo.$(element);
    this.wrapperClass = '.checkbox-facet';
};

CheckboxFacet.ID = "CheckboxFacet";
CheckboxFacet.options = {
    title: Coveo.ComponentOptions.buildStringOption()
};

CheckboxFacet.prototype.buildComponent = function(groupByResults){
    // unbind events and remove old checkbox
    this.$element.find('.checkbox-facet').unbind().remove();

    // if there are any values in the groupby result, create the checkbox
    if (groupByResults.length){
        var checkbox = Coveo.$('<input />', {"class" : "checkbox-facet", "type" : "checkbox", "value" : "true"});

        // check the box if needed
        if (this.queryStateModel.get(this.stateName).length){
            checkbox.prop('checked', true);
        }

        checkbox.click(this.handleClick.bind(this));
        checkbox.appendTo(this.$element);
    }
};

CheckboxFacet.prototype.handleClick = function(e){
    var active = e.target.checked;
    this.queryStateChanged(e.target.value, active);
    this.queryController.deferExecuteQuery();
};

CheckboxFacet.prototype.queryStateChanged = function(field, active){
    var newQueryValues = [];

    // add or don't add this field
    if (active){
        newQueryValues.push(field);
    }

    this.queryStateModel.set(this.stateName, newQueryValues);
};

Coveo.CoveoJQuery.registerAutoCreateComponent(CheckboxFacet);