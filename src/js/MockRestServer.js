define(["require", "exports", "jquery", "ojs/ojconfig", "./jquery.mockjax"], function (require, exports, $, Config) {
    "use strict";
    class MockRESTServer {
        constructor(data, options) {
            this.getDataFromId = (id) => {
                const data = this.getData();
                if (data instanceof Array) {
                    const retVal = [];
                    for (let i = 0; i < data.length; i++) {
                        if (data[i][this.parentField] == id) {
                            retVal.push(data[i]);
                        }
                    }
                    return JSON.stringify(retVal);
                }
                return data;
            };
            this.getURL = () => {
                return this.url;
            };
            this.shutdown = () => {
                $.mockjax.clear();
            };
            this.getData = () => {
                // Check to see if data is lurking down property (like ADF bc REST)
                if (this.data instanceof Array) {
                    return this.data;
                }
                for (let prop in this.data) {
                    if (this.data.hasOwnProperty(prop)) {
                        if (this.data[prop] instanceof Array) {
                            return this.data[prop];
                        }
                    }
                }
                return this.data;
            };
            const self = this;
            options = options || {};
            this.data = data;
            this.timeout = options['timeout'] ? options['timeout'] : MockRESTServer.timeout;
            this.url = options['url'] ? options['url'] : "/context-root/ojet/items";
            this.idUrl = options['idUrl'] ? options['idUrl'] : MockRESTServer.idUrl;
            this.idPool = 1000;
            this.parentField = options['parentField'];
            this.idField = options['id'];
            const proxy = options['proxy'];
            const fetchParam = options['fetchParam'];
            const responseTime = options['responseTime'] ? options['responseTime'] : 10;
            const posturl = options['postUrl'];
            const mockOptions = {
                url: this.url,
                type: 'GET',
                contentType: 'json',
                responseTime: responseTime,
                response: function (settings) {
                    let retVal;
                    if (settings.hasOwnProperty('urlParams') && settings.urlParams.hasOwnProperty('id')) {
                        retVal = self.getDataFromId(settings.urlParams.id);
                    }
                    else {
                        retVal = self.data ? JSON.stringify(self.data) : self.data;
                    }
                    // Test that certain headers are passed:
                    if (window["QUnit"]) {
                        QUnit.config.current.assert.equal(settings['headers']['Accept-Language'], Config.getLocale(), "Test Accept-Language locale header setting");
                    }
                    if (settings['dataType'] === 'jsonp' && settings['jsonpCallback']) {
                        this.responseText = settings['jsonpCallback'] + "(" + retVal + ");";
                    }
                    else {
                        this.responseText = retVal;
                    }
                }
            };
            if (fetchParam) {
                mockOptions['urlParams'] = ['id'];
            }
            if (proxy) {
                mockOptions['proxy'] = proxy;
            }
            // fetch
            $.mockjax(mockOptions);
            // delete
            $.mockjax({
                url: this.idUrl,
                urlParams: ['id'],
                type: 'DELETE',
                responseTime: responseTime,
                response: function (settings) {
                    const id = settings.urlParams.id;
                    // Find id in data list
                    const data = self.getData();
                    for (let i = 0; i < data.length; i++) {
                        if (data[i][self.idField] == id) {
                            data.splice(i, 1);
                            return;
                        }
                    }
                }
            });
            // create
            $.mockjax({
                url: posturl ? posturl : this.url,
                urlParams: ['id'],
                type: 'POST',
                responseTime: responseTime,
                response: function (settings) {
                    const data = self.getData();
                    data.push(JSON.parse(settings.data));
                    const item = data[data.length - 1];
                    const id = settings.urlParams ? settings.urlParams.id : null;
                    if (id) {
                        item[self.idField] = id;
                    }
                    else {
                        // Assign an ID
                        if (!item[self.idField]) {
                            item[self.idField] = self.idPool.toString();
                            self.idPool++;
                        }
                    }
                    this.responseText = item;
                }
            });
            // update
            $.mockjax({
                url: this.idUrl,
                urlParams: ['id'],
                type: 'PUT',
                responseTime: responseTime,
                response: function (settings) {
                    const id = settings.urlParams.id;
                    // Find id in data list
                    const data = self.getData();
                    for (let i = 0; i < data.length; i++) {
                        const x = data[i];
                        if (x[self.idField] == id) {
                            // Update data fields
                            data[i] = JSON.parse(settings.data);
                            this.responseText = data[i];
                        }
                    }
                }
            });
            // patch
            $.mockjax({
                url: this.idUrl,
                urlParams: ['id'],
                type: 'PATCH',
                responseTime: responseTime,
                response: function (settings) {
                    const id = settings.urlParams.id;
                    // Find id in data list
                    const data = self.getData();
                    for (let i = 0; i < data.length; i++) {
                        const x = data[i];
                        if (x[self.idField] == id) {
                            // Update data fields
                            data[i] = JSON.parse(settings.data);
                            this.responseText = data[i];
                        }
                    }
                }
            });
            // read one item
            $.mockjax({
                url: this.idUrl,
                urlParams: ['id'],
                type: 'GET',
                responseTime: responseTime,
                response: function (settings) {
                    const id = settings.urlParams.id;
                    // Find id in data list
                    const data = self.getData();
                    for (let i = 0; i < data.length; i++) {
                        const x = data[i];
                        if (x[self.idField] == id) {
                            this.responseText = data[i];
                            return;
                        }
                    }
                    this.responseText = undefined;
                    this.status = 204;
                }
            });
        }
    }
    MockRESTServer.timeout = 10;
    MockRESTServer.idUrl = /^\/context-root\/ojet\/items\/([\d]+)$/i;
    ;
    return MockRESTServer;
});
