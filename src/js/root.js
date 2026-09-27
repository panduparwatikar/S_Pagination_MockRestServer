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
  'text!./departments.json', './jquery.mockjax', 'ojs/ojknockout', 'ojs/ojtable', 'ojs/ojpagingcontrol', 'ojs/ojbutton'],
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
            self.columns = [{ "field": "DepartmentId", "headerText": "Department ID" },
            { "field": "DepartmentName", "headerText": "Department Name" },
            { "field": "ManagerId", "headerText": "Manager ID" },
            { "field": "LocationId", "headerText": "Location ID" },
            { "template": "deleteRow", "headerText": "" }];
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
        // release the application bootstrap busy state
        Context.getPageContext().getBusyContext().applicationBootstrapComplete();
        ko.applyBindings(new ViewModel());
      });
  }
);
