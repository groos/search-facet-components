__extends(CheckboxFacet, _super);
function CheckboxFacet(element, options, bindings){
    _super.call(this, element, CheckboxFacet.ID, bindings);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, CheckboxFacet, options);
    this.$element = Coveo.$(element);
    this.stateName = Coveo.QueryStateModel.getFacetId(this.options.field);
    this.wrapperClass = '.checkbox-facet';

    this.queryStateModel.registerNewAttribute(this.stateName, []);

    this.bind.onRoot(Coveo.QueryEvents.buildingQuery, this.handleBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.handleQueryStateChanged, this.handleQueryStateChange);
    this.bind.onRoot(Coveo.QueryEvents.doneBuildingQuery, this.handleDoneBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.deferredQuerySuccess, this.handleQuerySuccess);

    this.bind.onRoot(Coveo.BreadcrumbEvents.populateBreadcrumb, this.handlePopulateBreadcrumb);
};

CheckboxFacet.ID = "CheckboxFacet";
CheckboxFacet.options = {
    field: Coveo.ComponentOptions.buildStringOption(),
    title: Coveo.ComponentOptions.buildStringOption()
};

/////////////////////////////////////////////////////////////////////// Begin Facet Breadcrumb methods

CheckboxFacet.prototype.handlePopulateBreadcrumb = function (e, args) {
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

CheckboxFacet.prototype.getValueCaption = function(facetValue){
    return facetValue.value;
};

CheckboxFacet.prototype.deselectValue = function(value){
    this.queryFieldChanged(value, false);
};

CheckboxFacet.prototype.triggerNewQuery = function(beforeExecuteQuery){
    this.queryController.deferExecuteQuery();
};

//////////////////////////////////////////////////////////////////////// End Facet Breadcrumb methods

CheckboxFacet.prototype.buildExpression = function() {
    var stateArray = this.queryStateModel.get(this.stateName);
    if (!stateArray || !stateArray.length){
        return null;
    }

    var builder = new Coveo.ExpressionBuilder();
    builder.add(this.options.field);
    
    return builder.build();
};

CheckboxFacet.prototype.handleBuildingQuery = function(e, data){
    var expression = this.buildExpression();
    if (expression){
        data.queryBuilder.advancedExpression.add(expression);
    }
};

CheckboxFacet.prototype.handleDoneBuildingQuery = function(e, args){
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

CheckboxFacet.prototype.handleQuerySuccess = function(e, data){
    this.buildCheckbox(data.results.groupByResults);
};

CheckboxFacet.prototype.buildCheckbox = function(groupByResults){
    var self = this;

    // unbind events and remove old checkbox
    this.$element.find('.checkbox-facet').unbind().remove();

    // get the groupby field for this component
    var groupByMatch = groupByResults.find(function(e){
        return '@' + e.Field === self.options.field;
    }, self);

    // if there are any values in the groupby result, create the checkbox
    if (groupByMatch && groupByMatch.values.length){
        var checkbox = Coveo.$('<input />', {"class" : "checkbox-facet", "type" : "checkbox", "value" : "true"});

        // check the box if needed
        if (this.queryStateModel.get(this.stateName).length){
            checkbox.prop('checked', true);
        }

        checkbox.click(function(e){
            var active = this.checked;
            self.queryFieldChanged(e.target.value, active);
            self.queryController.deferExecuteQuery();
        });

        checkbox.appendTo(self.$element);
    }
};

CheckboxFacet.prototype.queryFieldChanged = function(field, active){
    var newQueryValues = [];

    // add or don't add this field
    if (active){
        newQueryValues.push(field);
    }

    this.queryStateModel.set(this.stateName, newQueryValues);
};

Coveo.CoveoJQuery.registerAutoCreateComponent(CheckboxFacet);