__extends(CheckboxListFacet, FacetBase);
function CheckboxListFacet(element, options, bindings){
    FacetBase.call(this, element, options, bindings, CheckboxListFacet.ID);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, CheckboxListFacet, options);

    this.$element = Coveo.$(element);
    this.wrapperClass = '.list-checkbox-wrapper';
    this.operator = "==";
};

CheckboxListFacet.ID = "CheckboxListFacet";
CheckboxListFacet.options = {
    title: Coveo.ComponentOptions.buildStringOption()
};

CheckboxListFacet.prototype.buildComponent = function(groupByResults){
    this.$element.find(this.wrapperClass).unbind().remove();

    var queryState = this.queryStateModel.get(this.stateName);

    groupByResults.forEach(function(element){
        var name = element.Value;

        var checkboxWrapper = Coveo.$('<div />', {class: "list-checkbox-wrapper"});
        Coveo.$('<input />', {id : "list-checkbox-" + name, "class": "list-checkbox", "type": "checkbox", "value": name}).appendTo(checkboxWrapper);
        Coveo.$('<p />', {"text": name}).appendTo(checkboxWrapper);

        if (queryState.indexOf(name) >= 0){
            checkboxWrapper.find('#list-checkbox-' + name).prop('checked', true);
        }            

        checkboxWrapper.appendTo(this.$element);
    }, this);

    this.$element.find('.list-checkbox').click(this.handleClick.bind(this));
};

CheckboxListFacet.prototype.handleClick = function(e){
    // update the query state
    var active = e.target.checked;
    this.queryStateChanged(e.target.value, active);
    this.queryController.deferExecuteQuery();
};

CheckboxListFacet.prototype.queryStateChanged = function(field, active){
    var oldQueryValues = this.queryStateModel.get(this.stateName);
    var newQueryValues = [];
    
    // add any other existing fields to query
    newQueryValues = oldQueryValues.filter(function(oldFieldValue){
        return oldFieldValue.toLowerCase() !== field.toLowerCase();
    });

    // add or don't add this field
    if (active){
        newQueryValues.push(field);
    }

    this.queryStateModel.set(this.stateName, newQueryValues);
};

Coveo.CoveoJQuery.registerAutoCreateComponent(CheckboxListFacet);