__extends(RadioButtonFacet, _super);
function RadioButtonFacet(element, options, bindings){
    _super.call(this, element, RadioButtonFacet.ID, bindings);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, RadioButtonFacet, options);

    // SUPER?
    this.$element = Coveo.$(element);
    this.stateName = Coveo.QueryStateModel.getFacetId(this.options.field);
    this.wrapperClass = '.radio-button-wrapper';
    
    this.queryStateModel.registerNewAttribute(this.stateName, []);
    this.bind.onRoot(Coveo.QueryEvents.buildingQuery, this.handleBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.handleQueryStateChanged, this.handleQueryStateChange);
    this.bind.onRoot(Coveo.QueryEvents.doneBuildingQuery, this.handleDoneBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.deferredQuerySuccess, this.handleQuerySuccess);

    this.bind.onRoot(Coveo.BreadcrumbEvents.populateBreadcrumb, this.handlePopulateBreadcrumb);
};

RadioButtonFacet.ID = "RadioButtonFacet";
RadioButtonFacet.options = {
    field: Coveo.ComponentOptions.buildStringOption(),
    title: Coveo.ComponentOptions.buildStringOption()
};


/////////////////////////////////////////////////////////////////////// Begin Facet Breadcrumb methods

RadioButtonFacet.prototype.handlePopulateBreadcrumb = function (e, args) {
    Coveo.Assert.exists(args);
    var stateArray = this.queryStateModel.get(this.stateName);

    var facetValues = [];

    stateArray.forEach(function(facetValue){
        facetValues.push(Coveo.FacetValue.createFromValue(facetValue));
    })
    
    if (facetValues.length) {
        var element = new Coveo.BreadcrumbValueList(this, facetValues, Coveo.BreadcrumbValueElement).build();
        args.breadcrumbs.push({
            element: element.get(0)
        });
    }
};

RadioButtonFacet.prototype.getValueCaption = function(facetValue){
    return facetValue.value;
};

RadioButtonFacet.prototype.deselectValue = function(value){
    this.queryFieldChanged(value, false);
};

RadioButtonFacet.prototype.triggerNewQuery = function(beforeExecuteQuery){
    this.queryController.deferExecuteQuery();
};

//////////////////////////////////////////////////////////////////////// End Facet Breadcrumb methods


RadioButtonFacet.prototype.buildExpression = function(){
    var stateArray = this.queryStateModel.get(this.stateName);

    if (!stateArray || !stateArray.length){
        return null;
    }

    var builder = new Coveo.ExpressionBuilder();
    builder.addFieldExpression(this.options.field, '==', stateArray);

    return builder.build();
};

RadioButtonFacet.prototype.handleQueryStateChanged = function(e, data){
    // make sure all the UI is consistent with query state
};

RadioButtonFacet.prototype.handleBuildingQuery = function(e, data){
    var expression = this.buildExpression();
    if (expression){
        data.queryBuilder.advancedExpression.add(expression);
    }
};

RadioButtonFacet.prototype.handleDoneBuildingQuery = function(e, args){
    // now that the query is built, add the group-by request
    if (args && args.queryBuilder) {
        var expression = this.buildExpression();

        var groupByRequest= { "field": this.options.field,
                              "sortCriteria": "AlphaDescending"
                            }

        // based on CoveoFacet
        var queryOverride = expression ? args.queryBuilder.computeCompleteExpressionPartsExcept(expression) : args.queryBuilder.computeCompleteExpressionParts();
        groupByRequest.queryOverride = queryOverride.withoutConstant;
        groupByRequest.constantQueryOverride = queryOverride.constant;

        args.queryBuilder.groupByRequests.push(groupByRequest);
    }
};

RadioButtonFacet.prototype.handleQuerySuccess = function(e, data) {
    this.buildRadioButtons(data.results.groupByResults);
};

RadioButtonFacet.prototype.buildRadioButtons = function(groupByResults) {
    var self = this;

    // unbind events and remove old radio buttons
    this.$element.find(this.wrapperClass).unbind().remove();
    
    // add new radio buttons
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

    // check any active filters. 
    var genderFilter = this.queryStateModel.get(this.stateName);
    if (genderFilter){
        this.$element.find('#radio-button-' + genderFilter).prop('checked', true);
    }

    this.$element.find('.radio-button').click(function(e){
        var active = this.checked;
        self.queryFieldChanged(e.target.value, active);
        self.queryController.deferExecuteQuery();
    });
};

RadioButtonFacet.prototype.queryFieldChanged = function(field, active){
    var newQueryValues = [];

    // add or don't add this field
    if (active){
        newQueryValues.push(field);
    }

    this.queryStateModel.set(this.stateName, newQueryValues);
};

Coveo.CoveoJQuery.registerAutoCreateComponent(RadioButtonFacet);