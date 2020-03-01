let inputModels = {};
let ruleChains = {};
let ruleChainNodes = {};
let ruleChainRelationships = {};

//------------------ Test Datasource ------------------//
const path = require('path');
const ruleTabDataUtil = require(path.join(__dirname,"RuleUtils","RuleTableDataUtil.js"));
var ruleManagerData = require(path.join(__dirname,"_SampleRuleManagerData.js"));

inputModels = ruleTabDataUtil.convertRowToObj("IMID", ruleManagerData.RuleChainInputModel);
ruleChains = ruleTabDataUtil.convertRowToObj("RCID", ruleManagerData.RuleChain);
ruleChainNodes = ruleTabDataUtil.convertRowToObj("RCNID", ruleManagerData.RuleChainNode);
ruleChainRelationships = ruleTabDataUtil.convertRowToObj("RCRID", ruleManagerData.RuleChainRelationship);
//------------------ Test Datasource ------------------//

//-----------------------------------------------------//
//Retrieves rule chains
const getRuleChain = function(input){
    
    let returnObj = {};

    //check get by RCID
    let rcid_returnObj = {};
    if(typeof input.RCID !== 'undefined'){
        //check if get by array or single
        if(Array.isArray(input.RCID)){ // request is by an array
            for(let imidi = 0;  imidi < input.RCID.length; imidi++){
                let result = ruleTabDataUtil.findById(ruleChains, input.RCID[imidi])
                for(let idx = 0; idx < Object.keys(result).length; idx++){
                    rcid_returnObj[Object.keys(result)[idx]] = result[Object.keys(result)[idx]];
                }
            }
        }else{ // request is by a single

            let result = ruleTabDataUtil.findById(ruleChains, input.RCID);
            for(let idx = 0; idx < Object.keys(result).length; idx++){
                rcid_returnObj[Object.keys(result)[idx]] = result[Object.keys(result)[idx]];
            }
        }
    }else{
        rcid_returnObj = ruleChains;
    }

    //check get by IMID
    let imid_returnObj = {};
    if(typeof input.IMID !== 'undefined'){
        //check if get by array or single
        if(Array.isArray(input.IMID)){ // request is by an array of IMIDs
            for(let imidi = 0;  imidi < input.IMID.length; imidi++){
                // let result = ruleTabDataUtil.findById(ruleChain, input.IMID[imidi]);
                let result = ruleTabDataUtil.findByProp(rcid_returnObj, "IMID", input.IMID[imidi])
                for(let idx = 0; idx < Object.keys(result).length; idx++){
                    imid_returnObj[Object.keys(result)[idx]] = result[Object.keys(result)[idx]];
                }
                // imid_returnObj[Object.keys(result)[0]] = result[Object.keys(result)[0]];
            }
        }else{ // request is by a single IMID
            imid_returnObj = ruleTabDataUtil.findByProp(rcid_returnObj, "IMID", input.IMID)
        }
    }else{
        imid_returnObj = rcid_returnObj;
    }

    //check get by type
    let tid_returnObj = {};
    if(typeof input.Type !== 'undefined'){
        //check if get by array or single
        if(Array.isArray(input.Type)){ // request is by an array of IMIDs
            for(let imidi = 0;  imidi < input.Type.length; imidi++){
                let result = ruleTabDataUtil.findByProp(imid_returnObj, "Type", input.Type[imidi])
                for(let idx = 0; idx < Object.keys(result).length; idx++){
                    tid_returnObj[Object.keys(result)[idx]] = result[Object.keys(result)[idx]];
                }
                // tid_returnObj[Object.keys(result)[0]] = result[Object.keys(result)[0]];
            }
        }else{ // request is by a single IMID
            tid_returnObj = ruleTabDataUtil.findByProp(imid_returnObj, "Type", input.Type)
        }
    }else{
        tid_returnObj = imid_returnObj;
    }
    
    returnObj = tid_returnObj;
    return returnObj;
};

//-----------------------------------------------------//
//Retrieves rule chain nodes
const getRuleChainNode = function(input){

    let returnObj = {};

    //check get by IMID
    let rcid_returnObj = {};
    if(typeof input.RCID !== 'undefined'){
        //check if get by array or single
        if(Array.isArray(input.RCID)){ // request is by an array of IMIDs
            for(let imidi = 0;  imidi < input.RCID.length; imidi++){
                let result = ruleTabDataUtil.findByProp(ruleChainNodes, "RCID", input.RCID[imidi])
                for(let idx = 0; idx < Object.keys(result).length; idx++){
                    rcid_returnObj[Object.keys(result)[idx]] = result[Object.keys(result)[idx]];
                }
            }
        }else{ // request is by a single IMID
            rcid_returnObj = ruleTabDataUtil.findByProp(ruleChainNodes, "RCID", input.RCID)
        }
    }else{
        rcid_returnObj = ruleChainNodes;
    }
    returnObj = rcid_returnObj;

    //special requirement - include a RCNID back into each object
    let tempRetObj = {};
    Object.keys(returnObj).forEach(function(key){
        let rObjItem = returnObj[key];
        rObjItem.RCNID = key;
        tempRetObj[key] = rObjItem;
    });
    returnObj = tempRetObj;

    return returnObj;
};

//-----------------------------------------------------//
////Retrieves rule chain relationship
const getRuleChainRelationship = function(input){
    let returnObj = {};

    //check get by IMID
    let rcid_returnObj = {};
    if(typeof input.RCID !== 'undefined'){
        //check if get by array or single
        if(Array.isArray(input.RCID)){ // request is by an array of IMIDs
            for(let imidi = 0;  imidi < input.RCID.length; imidi++){
                let result = ruleTabDataUtil.findByProp(ruleChainRelationships, "RCID", input.RCID[imidi])
                for(let idx = 0; idx < Object.keys(result).length; idx++){
                    rcid_returnObj[Object.keys(result)[idx]] = result[Object.keys(result)[idx]];
                }
            }
        }else{ // request is by a single IMID
            rcid_returnObj = ruleTabDataUtil.findByProp(ruleChainRelationships, "RCID", input.RCID)
        }
    }else{
        rcid_returnObj = ruleChainRelationships;
    }

    returnObj = rcid_returnObj;
    return returnObj;
};

//-----------------------------------------------------//
//

//-----------------------------------------------------//
//Retrieves the input model based on the input
const getInputModel = function(input){
    if(typeof input === 'undefined') return;

    // if request is to return data by an actual input
    if(typeof input.model !== 'undefined'){
        let inModel = input.model;
        let inputModelsKeys = Object.keys(inputModels);
        for(let imki = 0; imki < inputModelsKeys.length; imki++){

            let id = inputModelsKeys[imki];
            let inputModel = inputModels[id];
            
            if (matchModelStructure(inputModel.DataModDef, inModel)){
                inputModel.IMID = id;
                return inputModel;
            }
        }
        return; // can only check by either input model or by input model attributes
    }

    //get by input model attributes
    let returnObj = {};

    //check get by IMID
    let imid_returnObj = {};
    if(typeof input.IMID !== 'undefined'){
        //check if get by array of IDs or single
        if(Array.isArray(input.IMID)){ // request is by an array of IMIDs
            for(let imidi = 0;  imidi < input.IMID.length; imidi++){
                let result = ruleTabDataUtil.findById(inputModels, input.IMID[imidi]);
                for(let idx = 0; idx < Object.keys(result).length; idx++){
                    imid_returnObj[Object.keys(result)[idx]] = result[Object.keys(result)[idx]];
                }
                // imid_returnObj[Object.keys(result)[0]] = result[Object.keys(result)[0]];
            }
        }else{ // request is by a single IMID
            imid_returnObj = ruleTabDataUtil.findById(inputModels, input.IMID)
        }
    }else{
        imid_returnObj = inputModels;
    }
    
    returnObj = imid_returnObj;
    return returnObj;
};


//---------------------------------- standard functions
function matchModelStructure(modelDef, dataModel){
    //check counts 
    let modelDefKeyCount = Object.keys(modelDef).length;
    let dataModelKeyCount = Object.keys(dataModel).length;

    if(modelDefKeyCount !== dataModelKeyCount){ // if key count does not match
        return false;
    }

    //iterate every key of the dataModel
    let match = true;
    Object.keys(dataModel).forEach(function(dataModelKey){

        let dataModelType = (typeof dataModel[dataModelKey]).toLowerCase() === 'object' ? 'object': 'value';
        let modelDefType = (typeof modelDef[dataModelKey]).toLowerCase() === 'object' ? 'object': 'value';

        if(dataModelType === 'object'
            && typeof modelDef[dataModelKey] !== 'undefined'
            && dataModelType === modelDefType){

            match &= matchModelStructure(modelDef[dataModelKey], dataModel[dataModelKey]);

        }else if(typeof modelDef[dataModelKey] !== 'undefined'
            && dataModelType === modelDefType){

            match &= true;

        }else{

            match &= false;

        }

    });
    
    return match;
}
//-----------------------------------------------------//

module.exports = {getInputModel, getRuleChain, getRuleChainNode, getRuleChainRelationship};
