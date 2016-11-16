__extends(DropdownListFacet, FacetBase);
function DropdownListFacet(element, options, bindings){
    FacetBase.call(this, element, options, bindings, DropdownListFacet.ID);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, DropdownListFacet, options);

    this.$element = Coveo.$(element);

    this.currentSearch = "";
    this.expanded = false;
    this.outerWrapperClass = '.dropdown-list-wrapper';
    this.listItemsWrapperClass = '.dropdown-list-items';
    this.listLabelClass = '.dropdown-list-label';
    this.operator = "==";
    this.activeFilters = 0;
};

DropdownListFacet.ID = "DropdownListFacet";
DropdownListFacet.options = {
    title: Coveo.ComponentOptions.buildStringOption()
};

DropdownListFacet.prototype.buildComponent = function(groupByResults, userSearched){
    this.activeFilters = 0;

    this.$element.find(this.outerWrapperClass).unbind().remove();

    this.buildListWrappers();
    this.buildDropdownListElements(groupByResults);
    this.buildActiveFiltersFeatures();

    // If rebuilding from a user search, don't reset groupByResults and place cursor back in input
    if (userSearched){
        this.$element.find('.dropdown-list-text-input').focus();
    } else {
        this.groupByResults = groupByResults;
    }
};

DropdownListFacet.prototype.queryStateChanged = function(field, active){
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

DropdownListFacet.prototype.buildListWrappers = function(){
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
    searchInput.keyup(this.handleSearchInput.bind(this));
    searchInput.appendTo(dropdownWrapper);

    listWrapper.appendTo(this.$element);

    Coveo.$('.dropdown-list-label').click(this.handleLabelClick.bind(this));
};

DropdownListFacet.prototype.buildDropdownListElements = function(groupByResults){
    var dropdownWrapper = this.$element.find(this.listItemsWrapperClass);
    var queryState = this.queryStateModel.get(this.stateName);

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
            this.activeFilters++;
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
    }, this);

    Coveo.$('.dropdown-list-item-checkbox').click(this.handleCheckboxClick.bind(this));
};

DropdownListFacet.prototype.buildActiveFiltersFeatures = function(){
    var listLabelDiv = this.$element.find(this.listLabelClass);

    var activeFiltersText = this.activeFilters ? this.activeFilters : "all";
    Coveo.$('<span />', {"class" : "dropdown-filter-count-label", 
                        "text": "(" + activeFiltersText + ")",
                        "css" : {"padding-left" : "5px"}}).appendTo(listLabelDiv);

    // add 'X' to clear filters if any are active
    if (this.activeFilters > 0){
        var clearFilters = Coveo.$('<span />', {"text" : "X", "css" : {"margin-left" : "10px", "background-color" : "red", "cursor" : "default"}});

        // bind click event
        clearFilters.click(this.handleClearFiltersClick.bind(this));
        clearFilters.appendTo(listLabelDiv);
    }
};

DropdownListFacet.prototype.clearFilters = function(){
    this.resetSearch();
    this.queryStateModel.set(this.stateName, []);
    this.queryController.deferExecuteQuery();
};

DropdownListFacet.prototype.resetSearch = function(){
    this.currentSearch = "";
    this.expanded = false;
};

DropdownListFacet.prototype.handleSearchInput = function(e){
    var matches = [];
    this.currentSearch = e.target.value;

    matches = this.groupByResults.filter(function(element){
        return element.Value.toUpperCase().indexOf(e.target.value.toUpperCase()) >= 0;
    })

    this.buildComponent(matches, true);
};

DropdownListFacet.prototype.handleClearFiltersClick = function(e){
    this.clearFilters();
    return false;
};

DropdownListFacet.prototype.handleLabelClick = function(e){
    if (Coveo.$('.dropdown-list-items').css('display') == 'block'){
        Coveo.$('.dropdown-list-items').css("display", "none");
        this.expanded = false;
    } else {
        Coveo.$('.dropdown-list-items').css("display", "block");
        this.expanded = true;
    }
};

DropdownListFacet.prototype.handleCheckboxClick = function(e){
    this.resetSearch();
    var active = e.target.checked;
    this.queryStateChanged(e.target.value, active);
    this.queryController.deferExecuteQuery();
};

Coveo.CoveoJQuery.registerAutoCreateComponent(DropdownListFacet);