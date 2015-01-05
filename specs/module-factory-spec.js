var moduleFactory = require("../m12n/module").factory;

var addModule = {
    modules: {
        m1: {
            module: "test-module"
        },
        m2: {
            module: "test-module"
        }
    },
    relations:[
        {
            out: {
                module: "m1",
                method: "out_int"
            },

            in:{
                module: "m2",
                method: "in_int"
            }
        }
    ],
    in_int: "m1",
    out_int: "m2"
};

var composeDefinedModule = {
    modules: {
        m1: addModule,
        m2: addModule
    },
    relations:[
        {
            out: {
                module: "m1",
                method: "out_int"
            },

            in:{
                module: "m2",
                method: "in_int"
            }
        }
    ],
    in_int: "m1",
    out_int: "m2"
};

describe("module factory", function () {

    it("should be ble to init module with args", function () {
        var module = moduleFactory({
            "module": "test-module",
            "options": {
                "testString": "Works!"
            }
        });

        expect(module.out_string()).toBe("Works!");
    });

    it("should chain external modules", function (done) {
        var module = moduleFactory(addModule);

        module.out_int(function (value) {
            expect(value).toBe(3);
            done();
        });

        module.in_int(1);
    });

    it("should chain defined modules", function (done) {
        var module = moduleFactory(composeDefinedModule);

        module.out_int(function (value) {
            expect(value).toBe(5);
            done();
        });

        module.in_int(1);
    });

    it("should proxy returning functions", function () {
        var module = moduleFactory({
            module: "test-module"
        });

        expect(module.out_ui()).toBe("Works!");
    });
});