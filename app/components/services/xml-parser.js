'use strict';

angular.module('myApp.services.XMLParser', [
    'ngLodash'
])
.factory('XMLParser', ['lodash', function(lodash) {
  var shinyNewServiceInstance = new XMLParser(lodash);
  // factory function body that constructs shinyNewServiceInstance
  return shinyNewServiceInstance;
}]);


class XMLParser {
  constructor(lodash) {
    this._ = lodash;

    this.XMLNode = {
        name: "",
        children: [],
        text: ""
    }

    this.predicate = {
        name: "",
        parameters: []
    };

    this.rule = {
        then: {},
        "if": []
    };
  }

  getParent(origin, jsonNode) {
    if(origin == null || jsonNode == null || origin == jsonNode || origin.children.length == 0 ) {
        return null;
    }
    var stack = [];
    for(var i=0; i<origin.children.length; i++) {
        if(origin.children[i] == jsonNode) {
            return origin;
        }
        if(origin.children[i].children != null && origin.children[i].children.length > 0)
            stack.push(this.getParent(origin.children[i], jsonNode));
    }
    for(var i=0; i<stack.length; i++) {
        if(stack[i] != null) {
            return stack[i];
        }
    }
    return null;
  }

  parse(xmlString) {
    if(typeof xmlString != "string") {
        console.error("Parameter is not string!");
        return;
    }

    xmlString = xmlString.replace(/\n*\s*/g, '');

    var state = "read tag";

    var currentString = "";

    var XML = null;
    var pointer = null;

    for(var i=0; i<xmlString.length; i++) {
        var currentChar = xmlString[i]
        switch(state) {
            case "read tag": {
                if(currentChar == '<') {

                    if(currentString.length != 0) {
                        pointer.text = currentString;
                        currentString = "";
                        state = "read open tag name";
                        break;
                    } else
                    if(xmlString[i+1] == '/') {
                        state = "close tag finish";
                        currentString = "";
                        break;
                    }
                    else if(XML == null) {
                        XML = this._.cloneDeep(this.XMLNode);
                        pointer = XML;
                    } else {
                        var newNode = this._.cloneDeep(this.XMLNode);
                        pointer.children.push(newNode);
                        pointer = newNode;
                    }


                    state = "read open tag name";
                }
                else {
                    //child text
                    currentString += currentChar;
                }
                break;
            }
            case "read open tag name": {
                if( ['/', '>'].indexOf(currentChar) == -1 ) {
                    currentString += currentChar;
                } else if (currentChar == '/') {
                    currentString = "";
                    state = "close tag finish";
                } else if (currentChar == '>') {
                    pointer.name = currentString.replace(/\s*/g, "");
                    currentString = "";

                    state = "read tag";
                }
                break;
            }
            case "close tag finish": {
                if(currentChar == '>') {
                     pointer = this.getParent(XML, pointer);
                     state = "read tag";
                }
                break;
            }

        }
    }

    return XML;

  }


  parsedXMLToInternal(parsedXML) {
        if(typeof parsedXML != "object") {
            console.error("parameter is not object");
            return;
        }

        var facts = [];
        var rules = [];

        var rulesNode = null;
        var factsNode = null;
        for(var i=0; i<parsedXML.children.length; i++) {
            if(parsedXML.children[i].name == "rules") {
                rulesNode = parsedXML.children[i];
            }
            if(parsedXML.children[i].name == "facts") {
                factsNode = parsedXML.children[i];
            }
        }

        if(factsNode) {
            for(var i=0; i<factsNode.children.length; i++) {
                var fact = factsNode.children[i];

                var parsedFact = this._.cloneDeep(this.predicate);

                for(var j=0; j<fact.children.length; j++) {
                    var factComponent = fact.children[j];
                    if(factComponent.name == "name") {
                        parsedFact.name = factComponent.text;
                    }
                    if(factComponent.name == "parameter") {
                        parsedFact.parameters.push(factComponent.text);
                    }
                }

                facts.push(parsedFact);
            }
        }

        if(rulesNode) {
            for(var i=0; i<rulesNode.children.length; i++) {
                var rule = rulesNode.children[i];

                var parsedRule = this._.cloneDeep(this.rule);

                for(var j=0; j<rule.children.length; j++) {
                    if(rule.children[j].name == "then") {
                        var thenPredicate = this._.cloneDeep(this.predicate);

                        for(var k=0; k<rule.children[j].children.length; k++) {
                            var predicateComponent = rule.children[j].children[k];

                            if(predicateComponent.name == "name") {
                                thenPredicate.name = predicateComponent.text;
                            }
                            if(predicateComponent.name == "parameter") {
                                thenPredicate.parameters.push(predicateComponent.text);
                            }
                        }

                        parsedRule.then = thenPredicate;
                    }
                    else if(rule.children[j].name == "if") {
                        for(var k=0; k<rule.children[j].children.length; k++) {
                            var predicateOrOperator = rule.children[i].children[k];

                            if(predicateOrOperator.name == "predicate") {
                                var somePredicate = this._.cloneDeep(this.predicate);

                                for(var l=0; l<predicateOrOperator.children.length; l++) {
                                    var predicateComponent = predicateOrOperator.children[l];

                                    if(predicateComponent.name == "name") {
                                        somePredicate.name = predicateComponent.text;
                                    }
                                    if(predicateComponent.name == "parameter") {
                                        somePredicate.parameters.push(predicateComponent.text);
                                    }
                                }
                                parsedRule.if.push(somePredicate);
                            }
                            else if (predicateOrOperator.name == "and") {
                                parsedRule.if.push("and");
                            }
                            else if (predicateOrOperator.name == "or") {
                                parsedRule.if.push("or");
                            }
                        }
                    }
                }

                rules.push(parsedRule);
            }
        }

        return {
            facts: facts,
            rules: rules
        };
  }
}