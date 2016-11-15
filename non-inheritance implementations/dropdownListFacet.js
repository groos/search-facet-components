__extends(DropdownListFacet, _super);
function DropdownListFacet(element, options, bindings){
    _super.call(this, element, DropdownListFacet.ID, bindings);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, DropdownListFacet, options);

    this.$element = Coveo.$(element);
    this.stateName = Coveo.QueryStateModel.getFacetId(this.options.field);

    this.currentSearch = "";
    this.expanded = false;
    this.searching = false;
    this.wrapperClass = '.dropdown-list-wrapper';

    this.queryStateModel.registerNewAttribute(this.stateName, []);
    this.bind.onRoot(Coveo.QueryEvents.buildingQuery, this.handleBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.handleQueryStateChanged, this.handleQueryStateChange);
    this.bind.onRoot(Coveo.QueryEvents.doneBuildingQuery, this.handleDoneBuildingQuery);
    this.bind.onRoot(Coveo.QueryEvents.deferredQuerySuccess, this.handleQuerySuccess);

    this.bind.onRoot(Coveo.BreadcrumbEvents.populateBreadcrumb, this.handlePopulateBreadcrumb);
};

DropdownListFacet.ID = "DropdownListFacet";
DropdownListFacet.options = {
    field: Coveo.ComponentOptions.buildStringOption(),
    title: Coveo.ComponentOptions.buildStringOption()
};

/////////////////////////////////////////////////////////////////////// Begin Facet Breadcrumb methods

DropdownListFacet.prototype.handlePopulateBreadcrumb = function (e, args) {
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

DropdownListFacet.prototype.getValueCaption = function(facetValue){
    return facetValue.value;
};

DropdownListFacet.prototype.deselectValue = function(value){
    this.queryFieldChanged(value, false);
};

DropdownListFacet.prototype.triggerNewQuery = function(beforeExecuteQuery){
    this.queryController.deferExecuteQuery();
};

//////////////////////////////////////////////////////////////////////// End Facet Breadcrumb methods

DropdownListFacet.prototype.buildExpression = function() {
    var stateArray = this.queryStateModel.get(this.stateName);

    if (!stateArray || !stateArray.length){
        return null;
    }
    
    var builder  = new Coveo.ExpressionBuilder();
    builder.addFieldExpression(this.options.field, '==', stateArray);

    return builder.build();
};

DropdownListFacet.prototype.handleQueryStateChanged = function(e, data){
    // make sure all the UI is consistent with query state
};

DropdownListFacet.prototype.handleBuildingQuery = function(e, data){
    var expression = this.buildExpression();
    if (expression){
        data.queryBuilder.advancedExpression.add(expression);
    }
};

DropdownListFacet.prototype.handleDoneBuildingQuery = function(e, args){
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

DropdownListFacet.prototype.handleQuerySuccess = function(e, data){
    var self = this;

    var groupByMatch = data.results.groupByResults.find(function(e){
        return '@' + e.field === self.options.field;
    }, self);

    if (groupByMatch){
        // cache the groupby list. Probably don't need the entire object
        this.groupByResults = groupByMatch.values;
    }

    this.buildDropdownList(groupByMatch.values);
};

DropdownListFacet.prototype.handleSearchInput = function(e){
    var matches = [];
    this.currentSearch = e;

    this.groupByResults.forEach(function(element){
        if (element.Value.toUpperCase().indexOf(e.toUpperCase()) >= 0){
            matches.push(element);
        }
    });

    this.buildDropdownList(matches);
};

DropdownListFacet.prototype.buildDropdownList = function(groupByResults){
    var self = this;

    // unbind events and remove old DropdownListFacet
    this.$element.find(this.wrapperClass).unbind().remove();

    var activeFilters = 0;

    // Create the dropdown
    var listWrapper = Coveo.$('<div />', {"class" : "dropdown-list-wrapper", "css" : {"border" : "thin solid black"}});

    // add a top-level label that includes the number of active filters
    var listLabelDiv = Coveo.$('<div />', {"class" : "dropdown-list-label", "css" : {"border" : "thin solid grey"}});
    Coveo.$('<span />', {"text" : "Select " + this.options.field}).appendTo(listLabelDiv);
    listLabelDiv.appendTo(listWrapper);

    var display = this.expanded ? "block" : "none";
    var dropdownWrapper = Coveo.$('<div />', {"class" : "dropdown-list-items", "css" : {"display" : display}}).appendTo(listWrapper);

    // add a text input field for manual searches
    var searchInput = Coveo.$('<input />', {"class" : "dropdown-list-text-input",
                        "type" : "text",
                        "placeholder" : "Filter by " + this.options.field,
                        "css" : {"width" : "200px"}});

    // put any current search text into the box
    searchInput.val(this.currentSearch);
    
    searchInput.keyup(function(e){
        // add the current text value to the querystatemodel and run the search
        self.searching = true;
        self.handleSearchInput(e.target.value);
    });

    searchInput.appendTo(dropdownWrapper);

    // foreach groupby value add an entry to the dropdown
    var queryState = self.queryStateModel.get(this.stateName);
    groupByResults.forEach(function(element){
        var name = element.Value;
        var listItem = Coveo.$('<div />', {"id" : "dropdown-list-item-" + name,
                                        "class" : "dropdown-list-item",
                                        "value" : name,
                                        "css" : {}});

        var listItemCheckbox = Coveo.$('<input />', {"id" : "dropdown-list-item-checkbox-" + name,
                                                        "class" : "dropdown-list-item-checkbox",
                                                        "type" : "checkbox",
                                                        "value" : name});

        if (queryState.indexOf(name) >= 0){
            listItemCheckbox.prop('checked', true);
            activeFilters++;
        }

        var listItemLabel = Coveo.$('<span />', {"class": "dropdown-list-item-label", 
                                                "text" : name, 
                                                "css": {"padding-left":"5px"}});

        var count = element.score ? '(' + element.numberOfResults + ')': '+' + element.numberOfResults;
        var listItemCount = Coveo.$('<span />', {"class" : "dropdown-list-item-count",
                                                "text" : count,
                                                "css" : {"padding-left":"5px"}});

        listItemCheckbox.appendTo(listItem);
        listItemLabel.appendTo(listItem);
        listItemCount.appendTo(listItem);
        listItem.appendTo(dropdownWrapper);
    });

    // active filters label
    activeFilters = activeFilters ? activeFilters : "all";
    Coveo.$('<span />', {"class" : "dropdown-filter-count-label", 
                        "text": "(" + activeFilters + ")",
                        "css" : {"padding-left" : "5px"}}).appendTo(listLabelDiv);

    // add 'X' to clear filters if any are active
    if (activeFilters > 0){
        var clearFilters = Coveo.$('<span />', {"text" : "X", "css" : {"margin-left" : "10px", "background-color" : "red", "cursor" : "default"}});

        // bind click event
        clearFilters.click(function(e){
            self.clearFilters();
            return false;
        });

        clearFilters.appendTo(listLabelDiv);
    }

    // append the dropdown to self.$element
    listWrapper.appendTo(self.$element);

    // if searching, put focus in the text box
    if (this.searching){
        self.$element.find('.dropdown-list-text-input').focus();
    }

    // add click events to each dropdown item
    Coveo.$('.dropdown-list-label').click(function(e){
        if (Coveo.$('.dropdown-list-items').css('display') == 'block'){
            Coveo.$('.dropdown-list-items').css("display", "none");
            self.expanded = false;
        } else {
            Coveo.$('.dropdown-list-items').css("display", "block");
            self.expanded = true;
        }
    });

    Coveo.$('.dropdown-list-item-checkbox').click(function(e){
        self.resetSearch();
        //self.handleFacetChange();
        var active = this.checked;
        self.queryFieldChanged(e.target.value, active);
        self.queryController.deferExecuteQuery();
    });
};

DropdownListFacet.prototype.queryFieldChanged = function(field, active){
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

DropdownListFacet.prototype.handleFacetChange = function(){
    var checkedValues = [];

    this.$element.find('.dropdown-list-item-checkbox').each(function(i, element){
        if (Coveo.$(element).prop('checked')){
            checkedValues.push(element.value);
        }
    });
    
    this.queryStateModel.set(this.stateName, checkedValues);
};

DropdownListFacet.prototype.clearFilters = function(){
    this.$element.find('.dropdown-list-item-checkbox').each(function(i, element){
        if (Coveo.$(element).prop('checked')){
            Coveo.$(element).trigger('click');
        }
    });
};

DropdownListFacet.prototype.resetSearch = function(){
    this.currentSearch = "";
    this.expanded = false;
    this.searching = false;
};

Coveo.CoveoJQuery.registerAutoCreateComponent(DropdownListFacet);