__extends(CheckboxListFacet, _super);
function CheckboxListFacet(element, options, bindings){
    _super.call(this, element, CheckboxListFacet.ID, bindings);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, CheckboxListFacet, options);

    // SUPER?
    this.$element = Coveo.$(element);
    this.stateName = Coveo.QueryStateModel.getFacetId(this.options.field);
    
    this.wrapperClass = '.list-checkbox-wrapper';

    this.queryStateModel.registerNewAttribute(this.stateName, []);
    this.bind.onRoot(Coveo.QueryEvents.buildingQuery, this.handleBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.handleQueryStateChanged, this.handleQueryStateChange);
    this.bind.onRoot(Coveo.QueryEvents.doneBuildingQuery, this.handleDoneBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.deferredQuerySuccess, this.handleQuerySuccess);

    this.bind.onRoot(Coveo.BreadcrumbEvents.populateBreadcrumb, this.handlePopulateBreadcrumb);
};

CheckboxListFacet.ID = "CheckboxListFacet";
CheckboxListFacet.options = {
    field: Coveo.ComponentOptions.buildStringOption(),
    title: Coveo.ComponentOptions.buildStringOption()
};

/////////////////////////////////////////////////////////////////////// Begin Facet Breadcrumb methods

CheckboxListFacet.prototype.handlePopulateBreadcrumb = function (e, args) {
    Coveo.Assert.exists(args);
    var stateArray = this.queryStateModel.get(this.stateName);

    var facetValues = [];

    stateArray.forEach(function(facetValue){
        facetValues.push(Coveo.FacetValue.createFromValue(facetValue));
    });

    if (facetValues.length) {
        var element = new Coveo.BreadcrumbValueList(this, facetValues, Coveo.BreadcrumbValueElement).build();
        args.breadcrumbs.push({
            element: element.get(0)
        });
    }
};

CheckboxListFacet.prototype.getValueCaption = function(facetValue){
    return facetValue.value;
};

CheckboxListFacet.prototype.deselectValue = function(value){
    this.queryFieldChanged(value, false);
};

CheckboxListFacet.prototype.triggerNewQuery = function(beforeExecuteQuery){
    this.queryController.deferExecuteQuery();
};

//////////////////////////////////////////////////////////////////////// End Facet Breadcrumb methods

CheckboxListFacet.prototype.buildExpression = function(){
    var stateArray = this.queryStateModel.get(this.stateName);
    if (!stateArray || !stateArray.length){
        return null;
    }
    
    var builder  = new Coveo.ExpressionBuilder();
    builder.addFieldExpression(this.options.field, '==', stateArray);

    return builder.build();
};

CheckboxListFacet.prototype.handleQueryStateChanged = function(e, data){
    // make sure all the UI is consistent with query state
};

CheckboxListFacet.prototype.handleBuildingQuery = function(e, data){
    var expression = this.buildExpression();
    if (expression){
        data.queryBuilder.advancedExpression.add(expression);
    }
};

CheckboxListFacet.prototype.handleDoneBuildingQuery = function(e, args){
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

CheckboxListFacet.prototype.handleQuerySuccess = function(e, data){
    this.buildCheckboxList(data.results.groupByResults);
};

CheckboxListFacet.prototype.buildCheckboxList = function(groupByResults){
    var self = this;

    // unbind events and remove old checkboxes
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
        self.queryFieldChanged(e.target.value, active);
        self.queryController.deferExecuteQuery();
    });
};

CheckboxListFacet.prototype.queryFieldChanged = function(field, active){
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