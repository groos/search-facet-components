__extends(RadioButtonFacet, FacetBase);
function RadioButtonFacet(element, options, bindings){
    FacetBase.call(this, element, options, bindings, RadioButtonFacet.ID);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, RadioButtonFacet, options);
    this.wrapperClass = '.radio-button-wrapper';
    this.$element = Coveo.$(element);
};

RadioButtonFacet.ID = "RadioButtonFacet";
RadioButtonFacet.options = {
    title: Coveo.ComponentOptions.buildStringOption()
};

RadioButtonFacet.prototype.buildComponent = function(groupByResults) {
    var self = this;

    this.$element.find(this.wrapperClass).unbind().remove();
    
    var groupByMatch = groupByResults.find(function(e){
        return '@' + e.Field === self.options.field;
    }, self);

    if (groupByMatch){
        groupByMatch.values.forEach(function(element){
            var name = element.Value;
            
            var radioButtonWrapper = Coveo.$('<div />', {"class" : "radio-button-wrapper", "css" : {"display" : "inline"}});
            Coveo.$('<input />', {"id" : "radio-button-" + name,"class" : "radio-button", "type" : "radio", "value" : name}).appendTo(radioButtonWrapper);
            Coveo.$('<p />', {"text" : name}).appendTo(radioButtonWrapper);
            
            radioButtonWrapper.appendTo(self.$element);
        }, self);  
    }

    var genderFilter = this.queryStateModel.get(this.stateName);
    if (genderFilter){
        this.$element.find('#radio-button-' + genderFilter).prop('checked', true);
    }

    this.$element.find('.radio-button').click(function(e){
        var active = this.checked;
        self.queryStateChanged(e.target.value, active);
        self.queryController.deferExecuteQuery();
    });
};

RadioButtonFacet.prototype.queryStateChanged = function(field, active){
    var newQueryValues = [];

    // add or don't add this field
    if (active){
        newQueryValues.push(field);
    }

    this.queryStateModel.set(this.stateName, newQueryValues);
};

Coveo.CoveoJQuery.registerAutoCreateComponent(RadioButtonFacet);