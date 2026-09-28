/**
 * @license
 * Copyright (c) 2014, 2026, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/**
 * A top-level require call executed by the Application.
 * Although 'knockout' would be loaded in any case (it is specified as a  dependency
 * by some modules), we are listing it explicitly to get the reference to the 'ko'
 * object in the callback
 */
require(['ojs/ojbootstrap', 'ojs/ojcontext', 'knockout', 'ojs/ojmodel', 'MockRestServer', 'ojs/ojpagingdataproviderview', 'ojs/ojcollectiondataprovider',
  'text!./departments.json', './jquery.mockjax', 'ojs/ojknockout', 'ojs/ojtable', 'ojs/ojpagingcontrol',
   'ojs/ojbutton','ojs/ojtoolbar'],
  function (Bootstrap, Context, ko, ModelClass, MockRESTServer, PagingDataProviderView, CollectionDataProvider, jsonDataStr) {
    Bootstrap.whenDocumentReady().then(
      function () {
        var self;

        class ViewModel {
          constructor() {
            self = this;

            self.serviceURL = 'http://mockrest/stable/rest/Departments';
            self.Department = ModelClass.Model.extend({
              urlRoot: self.serviceURL,
              parse: self.parseDept,
              idAttribute: 'DepartmentId'
            });

            self.myDept = new self.Department();
            self.DeptCollection = ModelClass.Collection.extend({
              url: self.serviceURL + '?limit=10',
              model: self.myDept
            });

            self.collection = new self.DeptCollection();

            self.mockRESTServer = new MockRESTServer(JSON.parse(jsonDataStr), {
              id: 'DepartmentId',
              url: /^http:\/\/mockrest\/stable\/rest\/Departments(\?limit=([\d]*)?)$/i,
              idUrl: /^http:\/\/mockrest\/stable\/rest\/Departments\/([\d]+)(?:\\?limit=([\\d]*))$/i
            });

            self.pagingDataProvider = new PagingDataProviderView(new CollectionDataProvider(self.collection));

            self.columns = [{ "field": "DepartmentId", "headerText": "Department ID", "sortable": "disabled" },
            { "field": "DepartmentName", "headerText": "Department Name", "sortable": "disabled" },
            { "field": "ManagerId", "headerText": "Manager ID", "sortable": "disabled" },
            { "field": "LocationId", "headerText": "Location ID", "sortable": "disabled" },
            { "template": "deleteRow", "headerText": "", "sortable": "disabled" }];
          }

          parseDept(response) {
            return {
              DepartmentId: response.DepartmentId,
              DepartmentName: response.DepartmentName,
              LocationId: response.LocationId,
              ManagerId: response.ManagerId
            };
          }
        }

        ViewModel.prototype.deleteRow = (row) => {
          let model = $(".oj-table")[0].data.dataProvider.collection.get(row.key);
          $(".oj-table")[0].data.dataProvider.collection.remove(model);
        }

        ViewModel.prototype.addRow = () => {
          let modelLength = $(".oj-table")[0].data.dataProvider.collection.models.length;
          let newModel = new ModelClass.Model({
            "DepartmentId": modelLength,
            "DepartmentName": "New Department",
            "ManagerId": 999,
            "LocationId": 999
          });

          let startItemIndex=$(".oj-table")[0].data.getStartItemIndex();
          $(".oj-table")[0].data.dataProvider.collection.add(newModel,{at:startItemIndex});
        }

        // release the application bootstrap busy state
        Context.getPageContext().getBusyContext().applicationBootstrapComplete();
        ko.applyBindings(new ViewModel());
      });
  }
);
