//var _super = Coveo.Component;
__extends(MyComponent, _super);
function MyComponent(element, options, bindings) {
    _super.call(this, element, MyComponent.ID, bindings);
    this.options = Coveo.ComponentOptions.initComponentOptions(element, MyComponent, options);
};

MyComponent.ID = "MyComponent";
MyComponent.options = {
    someNumber: Coveo.ComponentOptions.buildNumberOption({ defaultValue: 5, min: 0 })
};
Coveo.CoveoJQuery.registerAutoCreateComponent(MyComponent);


