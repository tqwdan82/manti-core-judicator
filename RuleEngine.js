const path = require('path');
const ruleTabDataUtil = require(path.join(__dirname,"RuleUtils","RuleTableDataUtil.js"));
const ruleManager = require(path.join(__dirname,"RuleManager.js"));
const operationMap = {
    "gte": ">=",
    "gt": ">",
    "eq": "==",
    "lte": "<=",
    "lt": "<",
};

//-----------------------------------------------------//
//compute input
const compute = function(data){
    //get input model
    let inputModel = ruleManager.getInputModel({"model":data});
    // console.log(inputModel);

    //get rule chains expecting this model
    let ruleChains = ruleManager.getRuleChain({
        IMID:inputModel.IMID,
        Type: "root"
    });
    // console.log(ruleChains);

    //get rule chain nodes
    let ruleChainIds = Object.keys(ruleChains);
    let ruleChainNodes = ruleManager.getRuleChainNode({"RCID":ruleChainIds});
    // console.log(ruleChainNodes);

    //get rule chain nodes
    let ruleChainNodeRelationships = ruleManager.getRuleChainRelationship({"RCID":ruleChainIds});
    // console.log("==========================");
    // console.log(ruleChainNodeRelationships);

    //iterate through rule chain nodes to assign start(isRootNode = true) to node pointer
    let rcKeys = Object.keys(ruleChainNodes);
    let nodePointer = {};
    for(let rci = 0; rci < rcKeys.length; rci++){
        let rcKey = rcKeys[rci];
        let rcNode = ruleChainNodes[rcKey];
        // rcNode.RCNID = rcKey;
        if(rcNode.isRootNode) {
            nodePointer = rcNode;
            break;
        }
    }
    
    computeNode({
        "nodePointer": nodePointer,
        "ruleChainNodeRelationships": ruleChainNodeRelationships, 
        "ruleChainNodes": ruleChainNodes, 
        "data": data
    });

};

function computeNode(input){
    let nodePointer = input.nodePointer;
    let ruleChainNodeRelationships = input.ruleChainNodeRelationships;
    let ruleChainNodes = input.ruleChainNodes;
    let data = input.data;

    let nextPointer = null;
    if(nodePointer.Type === 'Filter'){

        nextPointer = computeFilterNode(input);

    }else if(nodePointer.Type === 'Chain'){

        nextPointer = computeChainNode(input);

    }else if(nodePointer.Type === 'Action'){

        nextPointer = computeActionNode(input);

    }else if(nodePointer.Type === 'Count'){

        nextPointer = computeCountNode(input);

    }
    
    if(nextPointer !== null){
        computeNode({
            "nodePointer": nextPointer,
            "ruleChainNodeRelationships": ruleChainNodeRelationships, 
            "ruleChainNodes": ruleChainNodes, 
            "data": data
        })
    }
};

function computeCountNode(input){
    let nodePointer = input.nodePointer;
    let ruleChainNodeRelationships = input.ruleChainNodeRelationships;
    let ruleChainNodes = input.ruleChainNodes;
    let data = input.data;

    //create the eva function String -----------start
    let allprops = nodePointer.Attribute.property.split(".");
    let condition = nodePointer.Attribute.condition;
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

    //create final exe function String
    let finalFuncString = '(' + funcString +')('+JSON.stringify(data)+');';
    //create the eva function String -----------End

    let nextPointer = null;
    let rcrKeys = Object.keys(ruleChainNodeRelationships);
    for(let rcri = 0; rcri < rcrKeys.length; rcri++){
        let rcrKey = rcrKeys[rcri];
        let rcRelationship = ruleChainNodeRelationships[rcrKey];
        
        if(rcRelationship.RCNID_Start === nodePointer.RCNID)
        { // if found relationship for node ==> there is more things to do
            
            //check if eval is correct
            if(eval(finalFuncString)){
                nextPointer = ruleChainNodes[rcRelationship.RCNID_End]; 
            }
        }
    }

    return nextPointer;
}

function computeFilterNode(input){
    let nodePointer = input.nodePointer;
    let ruleChainNodeRelationships = input.ruleChainNodeRelationships;
    let ruleChainNodes = input.ruleChainNodes;
    let data = input.data;
    
    //iterate through rule chain relationships to get starting with nodePointer
    let rcrKeys = Object.keys(ruleChainNodeRelationships);
    let nextPointer = null;
    for(let rcri = 0; rcri < rcrKeys.length; rcri++){
        let rcrKey = rcrKeys[rcri];
        let rcRelationship = ruleChainNodeRelationships[rcrKey];
        
        if(rcRelationship.RCNID_Start === nodePointer.RCNID)
        { // if found relationship for node ==> there is more things to do
            //generate operation code string
            let codeString = "input."+ nodePointer.Attribute + operationMap[rcRelationship.operation]+ rcRelationship.value;
            codeString = "(function(input){ return "+codeString+";})";
            let finalFuncString = '(' + codeString +')('+JSON.stringify(data)+');';
            
            //check if eval is correct
            if(eval(finalFuncString)){
                nextPointer = ruleChainNodes[rcRelationship.RCNID_End]; 
            }
        }
    }

    return nextPointer;
}

function computeChainNode(input){
    let nodePointer = input.nodePointer;
    let ruleChainNodeRelationships = input.ruleChainNodeRelationships;
    let ruleChainNodes = input.ruleChainNodes;
    let data = input.data;

    let chainId = nodePointer.Attribute;
    // console.log(chainId)
    let ruleChain = ruleManager.getRuleChain({
        RCID:chainId,
    });

     //get rule chain nodes
     let cruleChainIds = Object.keys(ruleChain);
     let cruleChainNodes = ruleManager.getRuleChainNode({"RCID":cruleChainIds});
 
     //get rule chain nodes
     let cruleChainNodeRelationships = ruleManager.getRuleChainRelationship({"RCID":cruleChainIds});
    // console.log(ruleChain)

    let rcKeys = Object.keys(cruleChainNodes);
    let cnodePointer = {};
    for(let rci = 0; rci < rcKeys.length; rci++){
        let rcKey = rcKeys[rci];
        let rcNode = cruleChainNodes[rcKey];
        // rcNode.RCNID = rcKey;
        if(rcNode.isRootNode) {
            cnodePointer = rcNode;
            break;
        }
    }
    
    computeNode({
        "nodePointer": cnodePointer,
        "ruleChainNodeRelationships": cruleChainNodeRelationships, 
        "ruleChainNodes": cruleChainNodes, 
        "data": data
    });

    let nextPointer = null;
    let rcrKeys = Object.keys(cruleChainNodeRelationships);
    for(let rcri = 0; rcri < rcrKeys.length; rcri++){
        let rcrKey = rcrKeys[rcri];
        let rcRelationship = ruleChainNodeRelationships[rcrKey];
        if(typeof rcRelationship !== 'undefined'
            && rcRelationship.RCNID_Start === nodePointer.RCNID)
        { // if found relationship for node ==> there is more things to do
            //generate operation code string            
            nextPointer = ruleChainNodes[rcRelationship.RCNID_End]; 
        }
    }
    return nextPointer;
}

function computeActionNode(input){
    let nodePointer = input.nodePointer;
    let ruleChainNodeRelationships = input.ruleChainNodeRelationships;
    let ruleChainNodes = input.ruleChainNodes;
    let data = input.data;

    //iterate through rule chain relationships to get starting with nodePointer
    let rcrKeys = Object.keys(ruleChainNodeRelationships);
    let finalFuncString = '(' + nodePointer.Attribute +')('+JSON.stringify(data)+');';
    eval(finalFuncString);

    let nextPointer = null;
    for(let rcri = 0; rcri < rcrKeys.length; rcri++){
        let rcrKey = rcrKeys[rcri];
        let rcRelationship = ruleChainNodeRelationships[rcrKey];
        if(rcRelationship.RCNID_Start === nodePointer.RCNID)
        { // if found relationship for node ==> there is more things to do
            //get next pointer        
            nextPointer = ruleChainNodes[rcRelationship.RCNID_End]; 
        }
    }
    return nextPointer;
    
}

module.exports = {compute};