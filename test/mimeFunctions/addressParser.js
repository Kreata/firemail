this.addressParserTests = {
    "Single address": function(test){
        var input = "andris@tr.ee",
            expected = [{address:"andris@tr.ee", name:""}];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    },
    "Multiple addresses": function(test){
        var input = "andris@tr.ee, andris@example.com",
            expected = [{address:"andris@tr.ee", name:""}, {address:"andris@example.com", name:""}];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    },
    "With unquoted name": function(test){
        var input = "andris <andris@tr.ee>",
            expected = [{name: "andris", address:"andris@tr.ee"}];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    },
    "With quoted name": function(test){
        var input = "\"reinman, andris\" <andris@tr.ee>",
            expected = [{name: "reinman, andris", address:"andris@tr.ee"}];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    },
    "Unquoted name, unquoted address": function(test){
        var input = "andris andris@tr.ee",
            expected = [{name: "andris", address:"andris@tr.ee"}];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    },
    "Emtpy group": function(test){
        var input = "Undisclosed:;",
            expected = [];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    },
    "Address group": function(test){
        var input = "Disclosed:andris@tr.ee, andris@example.com;",
            expected = [{name: "Disclosed", address:"andris@tr.ee"}, {name: "Disclosed", address:"andris@example.com"}];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    },
    "Name from comment": function(test){
        var input = "andris@tr.ee (andris)",
            expected = [{name: "andris", address:"andris@tr.ee"}];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    },
    "Skip comment": function(test){
        var input = "andris@tr.ee (reinman) andris",
            expected = [{name: "andris", address:"andris@tr.ee"}];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    },
    "No address": function(test){
        var input = "andris",
            expected = [{name: "andris", address:""}];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    },
    "Apostophe in name": function(test){
        var input = "O'Neill",
            expected = [{name: "O'Neill", address:""}];
        test.deepEqual(addressParser.parse(input), expected);
        test.done();
    }
};
