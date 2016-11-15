__extends(FacetBase, _super)
function FacetBase(element, options, bindings, id){
    _super.call(this, element, id, bindings);

    this.options = Coveo.ComponentOptions.initComponentOptions(element, FacetBase, options);
    this.stateName = Coveo.QueryStateModel.getFacetId(this.options.field);

    this.queryStateModel.registerNewAttribute(this.stateName, []);
    this.bind.onRoot(Coveo.QueryEvents.buildingQuery, this.handleBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.doneBuildingQuery, this.handleDoneBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.deferredQuerySuccess, this.handleQuerySuccess);

    this.bind.onRoot(Coveo.BreadcrumbEvents.populateBreadcrumb, this.handlePopulateBreadcrumb);
}

FacetBase.options = {
    field: Coveo.ComponentOptions.buildStringOption()
};

FacetBase.prototype.handlePopulateBreadcrumb = function (e, args) {
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

FacetBase.prototype.getValueCaption = function(facetValue){
    return facetValue.value;
};

FacetBase.prototype.deselectValue = function(value){
    this.queryStateChanged(value, false);
};

FacetBase.prototype.triggerNewQuery = function(beforeExecuteQuery){
    this.queryController.deferExecuteQuery();
};

FacetBase.prototype.buildExpression = function(){
    var stateArray = this.queryStateModel.get(this.stateName);
    if (!stateArray || !stateArray.length){
        return null;
    }
    
    var builder  = new Coveo.ExpressionBuilder();
    builder.addFieldExpression(this.options.field, '==', stateArray);

    return builder.build();
};

FacetBase.prototype.handleBuildingQuery = function(e, data){
    var expression = this.buildExpression();
    if (expression){
        data.queryBuilder.advancedExpression.add(expression);
    }
};

FacetBase.prototype.handleDoneBuildingQuery = function(e, args){
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

FacetBase.prototype.handleQuerySuccess = function(e, data){
    this.buildComponent(data.results.groupByResults);
};