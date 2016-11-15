__extends(DropdownListFacet, FacetBase);
function DropdownListFacet(element, options, bindings){
    FacetBase.call(this, element, options, bindings, DropdownListFacet.ID);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, DropdownListFacet, options);

    this.$element = Coveo.$(element);

    this.currentSearch = "";
    this.expanded = false;
    this.searching = false;
    this.wrapperClass = '.dropdown-list-wrapper';
};

DropdownListFacet.ID = "DropdownListFacet";
DropdownListFacet.options = {
    title: Coveo.ComponentOptions.buildStringOption()
};

DropdownListFacet.prototype.buildComponent = function(groupByResults){
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

    var groupByMatch = groupByResults.find(function(e){
        return '@' + e.Field === self.options.field;
    }, self);

    if (groupByMatch){
        self.groupByResults = groupByResults;

        groupByMatch.values.forEach(function(element){
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
    }

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
        var active = this.checked;
        self.queryStateChanged(e.target.value, active);
        self.queryController.deferExecuteQuery();
    });
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

DropdownListFacet.prototype.handleSearchInput = function(e){
    var self = this;
    var matches = [];
    this.currentSearch = e;

    var groupByMatch = this.groupByResults.find(function(e){
        return '@' + e.Field === self.options.field;
    }, self);

    if (groupByMatch){
        groupByMatch.values.forEach(function(element){
            if (element.Value.toUpperCase().indexOf(e.toUpperCase()) >= 0){
                //element.field = self.options.field;
                matches.push(element);
            }
        });
    }

    groupByMatch.values = matches;
    this.groupByResults = [groupByMatch];

    this.buildComponent(this.groupByResults);
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