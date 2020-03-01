const express = require('express');
const ruleMgr = require('./RuleManager.js');
const ruleEng = require('./RuleEngine.js');
var app=express();

// app.get('/',function(req,res)
// {
// res.send('Hello World!');
// });

let testData = {
    "name": "person 1",
    "age": 71,
    "gender": "M",
    "pet":[{
        "type": "cat",
        "gender": "F"
    }]
};
// let testData = {
//     "name": "person 1",
//     "age": 71,
//     "gender": "M",
//     "children":[
//         {
//             "name": "Child 1",
//             "age": 33,
//             "gender": "M",
//             "children":[
//                 {
//                     "name": "grandkid 1",
//                     "age": 3,
//                     "gender": "M",
//                     "children":[]
//                 }
//             ]
//         },
//         {
//             "name": "Child 2",
//             "age": 32,
//             "gender": "M",
//             "children":[
//                 {
//                     "name": "grandkid 2",
//                     "age": 2,
//                     "gender": "M",
//                     "children":[]
//                 }
//             ]
//         }
//     ]
// };

ruleEng.compute(testData);



// let prop = "p.p.children[].l.children[].zz.children[]";
// let prop = "children[].children[]";
// let condition = {
//     "property":"gender",
//     "op" : "===",
//     "value": "'M'"
// };
let prop = "pet[]";
let condition = 
{
    "property":"type",
    "op" : "===",
    "value": "'dog'"
};

//------------------------- sample start
// let input = testData; //testing purpose only
// let count = 0; // standard
// //----------------
// let children1 = input["children"];
// for(let i2 = 0; i2<children1.length;i2++){
// //----------------
//     //----------------
//     let children2 = children1[i2]["children"];
//     for(let i1 = 0; i1<children2.length; i1++){
//     //----------------
//         let inData = children2[i1];
//         if(inData['gender'] === 'M')
//             count++;
//     }
// }

// console.log(count);
//------------------------- sample end

let allprops = prop.split(".");
let varProp = [];
let endPointer = false;
let varString = "";
//form all the variable property string
for(let pi = 0; pi<allprops.length;pi++){
    let prop = allprops[pi];
    if(prop.indexOf("[]") > -1){ // hit the array portion

        varString += "['"+prop.substring(0, prop.indexOf("[]"))+"']";
        endPointer = true;

    }else{ // haven hit array

        varString += "['"+prop+"']";

    }

    if(endPointer){
        varProp.push(varString);
        varString = "";
        endPointer = false;
    }
    
}
// console.log(varProp);
//form the array loops
let funcString = "function(input){ let count = 0;";
let prevIndex = 0;
let pointerIndex = 0;
let closeCount = 0;
for(let vpi = 0; vpi<varProp.length;vpi++){
    let vpString = varProp[vpi];
    
    if(vpi === 0){// at top level
        //need to include input
        funcString += "let children"+vpi+" = input"+vpString+";";
        funcString += "for(let i"+vpi+" = 0; i"+vpi+"<children"+vpi+".length;i"+vpi+"++){";
        prevIndex = vpi;

    }else{ //not at top level
         //need to include input

         funcString += "let children"+vpi+" = children"+ prevIndex +"[i"+prevIndex+"]"+vpString+";";
         funcString += "for(let i"+vpi+" = 0; i"+vpi+"<children"+vpi+".length;i"+vpi+"++){";
         pointerIndex = vpi;
         prevIndex++;
         
    }
    closeCount++
    
}

//construct and attach the function implementation String
funcString += "let inData = children"+pointerIndex+"[i"+pointerIndex+"];";
if(condition && Object.keys(condition).length > 0 ){// not an empty
    funcString += "if(inData['" +condition.property+ "'] " + condition.op + condition.value + "){count++}";
}else{ // no conditions
    funcString += "count++";
}

//add the close braces
while(closeCount !== 0){
    funcString +="}"
    closeCount--;
}

//add close function string
funcString += "return count;}";

// console.log(funcString)
let exeFuncString = '(' + funcString +')('+JSON.stringify(testData)+');';
console.log(eval(exeFuncString));

// console.log(allprops)
// let evalProp = allprops[allprops.length-1];
// allprops.pop();
// evaluate (testData, evalProp, allprops);


// //check with StateManager whether currently there is any state waiting for this kinda data

// //if yes update the states 

// //else create a new state for rules that uses this input
// //---------------------------------------------------
// //1. get the input model based on the input
// let inputModel = ruleMgr.getInputModel({"model":testData});
// // console.log(ruleMgr.getInputModel({IMID:[inputModel.IMID, "im2"]}))
// // console.log(inputModel);

// //---------------------------------------------------
// //2. get all rules using this input model
// let ruleInputs = ruleMgr.getRuleInputs({
//     "inputModelId": inputModel.IMID,
//     // "ruleInputId" : "1"
// });
// // console.log(ruleInputs);
// //get all rules from the rule
// let ruleIds = [];
// Object.keys(ruleInputs).forEach(function(ruleInputId){
//     let ruleInput = ruleInputs[ruleInputId];
//     ruleIds.push(ruleInput.RuleID);
// });
// // console.log(ruleIds);

//---------------------------------------------------
//3. get all input models needed by the rule
//get all rule inputs by rule id






// let inputParam = {}
// let inputModel = ruleMgr.getInputModel(testData);
// inputParam[inputModel.IMID] = testData;
// console.log(inputParam);

// let ruleInputs = ruleMgr.getRuleInputs({
//     "inputModelId": inputModel.IMID,
//     // "ruleInputId" : "1"
// });
// console.log(ruleInputs);

// // let ruleInputModelIds = [];
// // let tempRuleInputModel = {};
// // Object.keys(ruleInputs).forEach( function(riKey){
// //     tempRuleInputModel[ruleInputs[riKey].IMID] = {};
// // });
// // ruleInputModelIds = Object.keys(tempRuleInputModel);
// // console.log(ruleInputModelIds);

// let ruleIdsObj = {};
// Object.keys(ruleInputs).forEach(function(key){
//     ruleIdsObj[ruleInputs[key].RuleID] = {};
// });
// let ruleIds = Object.keys(ruleIdsObj);
// // console.log(ruleIds);

// let ruleExps = {};
// ruleIds.forEach(function(key){
//     let ruleExpObj = ruleMgr.getRuleExpressions({
//         "ruleId": key,
//     });
//     Object.keys(ruleExpObj).forEach(function(id){
//         let retRuleExpObj = ruleExpObj[id];
//         //retRuleExpObj.ID = id;
//         ruleExps[id] = retRuleExpObj;
//     });

// });
// // console.log(ruleExps);

// let funcExpString = ruleEng.constructExpression(ruleExps);
// // console.log(funcExpString);
// ruleEng.compute(funcExpString, inputParam);


var server=app.listen(3000,function() {});