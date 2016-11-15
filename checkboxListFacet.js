__extends(CheckboxListFacet, FacetBase);
function CheckboxListFacet(element, options, bindings){
    FacetBase.call(this, element, options, bindings, CheckboxListFacet.ID);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, CheckboxListFacet, options);

    this.$element = Coveo.$(element);
    this.wrapperClass = '.list-checkbox-wrapper';
};

CheckboxListFacet.ID = "CheckboxListFacet";
CheckboxListFacet.options = {
    title: Coveo.ComponentOptions.buildStringOption()
};

CheckboxListFacet.prototype.buildComponent = function(groupByResults){
    var self = this;

    this.$element.find(this.wrapperClass).unbind().remove();

    var groupByMatch = groupByResults.find(function(e){
        return '@' + e.Field === self.options.field;
    }, self);

    if (groupByMatch){
        var queryState = self.queryStateModel.get(self.stateName);

        groupByMatch.values.forEach(function(element){
            var name = element.Value;

            var checkboxWrapper = Coveo.$('<div />', {class: "list-checkbox-wrapper"});
            Coveo.$('<input />', {id : "list-checkbox-" + name, "class": "list-checkbox", "type": "checkbox", "value": name}).appendTo(checkboxWrapper);
            Coveo.$('<p />', {"text": name}).appendTo(checkboxWrapper);

            if (queryState.indexOf(name) >= 0){
                checkboxWrapper.find('#list-checkbox-' + name).prop('checked', true);
            }            

            checkboxWrapper.appendTo(self.$element);
        }, self);
    }

    this.$element.find('.list-checkbox').click(function(e){
        // update the query state
        var active = this.checked;
        self.queryStateChanged(e.target.value, active);
        self.queryController.deferExecuteQuery();
    });
};

CheckboxListFacet.prototype.queryStateChanged = function(field, active){
    var oldQueryValues = this.queryStateModel.get(this.stateName);
    var newQueryValues = [];
    
    // add any other existing fields to query
    oldQueryValues.forEach(function(oldFieldValue){
        if (oldFieldValue.toLowerCase() !== field.toLowerCase()){
            newQueryValues.push(oldFieldValue);
        }
    });

    // add or don't add this field
    if (active){
        newQueryValues.push(field);
    }

    this.queryStateModel.set(this.stateName, newQueryValues);
};

Coveo.CoveoJQuery.registerAutoCreateComponent(CheckboxListFacet);