'use strict';

angular.module('myApp.services.PseudoPrologMachine', [
    'ngLodash'
])
.factory('PseudoPrologMachine', ['lodash', function(lodash) {
  var shinyNewServiceInstance = new PseudoPrologMachine(lodash);
  // factory function body that constructs shinyNewServiceInstance
  return shinyNewServiceInstance;
}]);

class PseudoPrologMachine {
    constructor(lodash) {
        this._ = lodash;

        this.knowledgeBase = null;

        this.predicate = {
            name: "",
            parameters: []
        };
    }

    load(base) {
        this.knowledgeBase = base;
    }

    predicateToString(predicate) {
        var text = predicate.name + "(";
        for (var j=0; j<predicate.parameters.length; j++) {
            if(text[text.length-1] != "(") {
                text += ",";
            }
            text += predicate.parameters[j];
        }
        text += ")";

        return text;
    }

    printAsArray() {
        var list = [];

        for(var i=0; i<this.knowledgeBase.facts.length; i++) {
            var fact = this.knowledgeBase.facts[i];
            list.push(this.predicateToString(fact) + ".");
        }

        for(var i=0; i<this.knowledgeBase.rules.length; i++) {
            var rule = this.knowledgeBase.rules[i];
            var text = "";
            text += this.predicateToString(rule.then) + ":-";

            for(var j=0; j<rule.if.length; j++) {
                if(rule.if[j] == "and") {
                    text+=",";
                } else if(rule.if[j] == "or") {
                    text+=";";
                } else {
                    text += this.predicateToString(rule.if[j]);
                }
            }

            list.push(text + ".");
        }
        return list;
    }

    parsePredicateFromText(string) {
        var predicate = this._.cloneDeep(this.predicate);

        arr = string.split("(");
        predicate.name = arr[0];

        subArr = arr[1].split(",");

        for(var i=0; i<subArr.length; i++) {
            predicate.parameters.push(subArr[i]);
        }

        return predicate;
    }

    isVariable(param) {
        return param[0].toUpperCase() == param[0];
    }

//    executeQuery(String) {
//        var queryPredicate = parsePredicateFromText(String);
//
//        var variables = [];
//        for(var i=0; i<queryPredicate.parameters.length; i++) {
//            var param = queryPredicate.parameters[i];
//            if(param[0].toUpperCase() == param[0]) {
//                variables.push({
//                    name: param,
//                    solution: "_"+param
//                });
//            }
//        }
//
//        var solutions = [];
//
//    }
}